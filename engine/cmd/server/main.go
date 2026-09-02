package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"depthwise/engine/internal/matching"
	"depthwise/engine/internal/orderbook"
	"depthwise/engine/internal/scenarios"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for dev
	},
}

// WSClientMessage represents incoming command from the frontend.
type WSClientMessage struct {
	Type        string `json:"type"` // "load_scenario" | "step" | "reset" | "jump_to" | "play" | "pause"
	ScenarioID  string `json:"scenario_id,omitempty"`
	Seq         int    `json:"seq,omitempty"`
	IntervalMs  int    `json:"interval_ms,omitempty"`
}

// WSServerMessage represents outgoing message to the frontend.
type WSServerMessage struct {
	Type         string                  `json:"type"` // "scenario_loaded" | "step_result" | "playback_state" | "error"
	Scenario     *scenarios.ScenarioMeta `json:"scenario,omitempty"`
	CurrentSeq   int                     `json:"current_seq"`
	TotalEvents  int                     `json:"total_events"`
	IsPlaying    bool                    `json:"is_playing"`
	Book         orderbook.BookSnapshot  `json:"book"`
	Trades       []orderbook.Trade       `json:"trades,omitempty"`
	AllTrades    []orderbook.Trade       `json:"all_trades,omitempty"`
	Explanation  *matching.StepExplanation `json:"explanation,omitempty"`
	AllExplanations []matching.StepExplanation `json:"all_explanations,omitempty"`
	ErrorMessage string                  `json:"error_message,omitempty"`
}

// Session represents a single user's interactive simulation session.
type Session struct {
	mu           sync.Mutex
	conn         *websocket.Conn
	engine       *matching.Engine
	scenario     *scenarios.ScenarioMeta
	currentIdx   int // index in scenario.Events (0 to len-1)
	allTrades    []orderbook.Trade
	explanations []matching.StepExplanation
	isPlaying    bool
	stopPlayChan chan struct{}
}

func newSession(conn *websocket.Conn) *Session {
	s := &Session{
		conn:         conn,
		engine:       matching.NewEngine(),
		allTrades:    make([]orderbook.Trade, 0),
		explanations: make([]matching.StepExplanation, 0),
		stopPlayChan: make(chan struct{}),
	}
	return s
}

func (s *Session) stopPlay() {
	if s.isPlaying {
		s.isPlaying = false
		close(s.stopPlayChan)
		s.stopPlayChan = make(chan struct{})
	}
}

func (s *Session) loadScenario(id string) error {
	s.stopPlay()
	sc := scenarios.GetScenarioByID(id)
	if sc == nil {
		return fmt.Errorf("unknown scenario id: %s", id)
	}

	s.scenario = sc
	s.engine = matching.NewEngine()
	s.currentIdx = 0
	s.allTrades = make([]orderbook.Trade, 0)
	s.explanations = make([]matching.StepExplanation, 0)

	return s.sendState("scenario_loaded", nil, nil)
}

func (s *Session) reset() {
	s.stopPlay()
	if s.scenario == nil {
		return
	}
	s.engine = matching.NewEngine()
	s.currentIdx = 0
	s.allTrades = make([]orderbook.Trade, 0)
	s.explanations = make([]matching.StepExplanation, 0)
	_ = s.sendState("scenario_loaded", nil, nil)
}

func (s *Session) step() error {
	if s.scenario == nil {
		return fmt.Errorf("no scenario loaded")
	}
	if s.currentIdx >= len(s.scenario.Events) {
		s.stopPlay()
		return nil // already at end
	}

	ev := s.scenario.Events[s.currentIdx]
	trades, exp := s.engine.ProcessStep(ev)
	s.currentIdx++

	s.allTrades = append(s.allTrades, trades...)
	s.explanations = append(s.explanations, exp)

	return s.sendState("step_result", trades, &exp)
}

func (s *Session) jumpTo(targetSeq int) error {
	s.stopPlay()
	if s.scenario == nil {
		return fmt.Errorf("no scenario loaded")
	}

	// Reset engine
	s.engine = matching.NewEngine()
	s.currentIdx = 0
	s.allTrades = make([]orderbook.Trade, 0)
	s.explanations = make([]matching.StepExplanation, 0)

	var lastExp *matching.StepExplanation
	var lastTrades []orderbook.Trade

	for s.currentIdx < len(s.scenario.Events) && s.currentIdx < targetSeq {
		ev := s.scenario.Events[s.currentIdx]
		trades, exp := s.engine.ProcessStep(ev)
		s.currentIdx++
		s.allTrades = append(s.allTrades, trades...)
		s.explanations = append(s.explanations, exp)
		lastExp = &exp
		lastTrades = trades
	}

	return s.sendState("step_result", lastTrades, lastExp)
}

func (s *Session) startPlay(intervalMs int) {
	s.stopPlay()
	if s.scenario == nil || s.currentIdx >= len(s.scenario.Events) {
		return
	}

	if intervalMs <= 0 {
		intervalMs = 600
	}

	s.isPlaying = true
	stopChan := s.stopPlayChan

	go func() {
		ticker := time.NewTicker(time.Duration(intervalMs) * time.Millisecond)
		defer ticker.Stop()

		for {
			select {
			case <-stopChan:
				return
			case <-ticker.C:
				s.mu.Lock()
				if !s.isPlaying || s.currentIdx >= len(s.scenario.Events) {
					s.isPlaying = false
					s.mu.Unlock()
					_ = s.sendPlaybackState()
					return
				}
				_ = s.step()
				s.mu.Unlock()
			}
		}
	}()

	_ = s.sendPlaybackState()
}

func (s *Session) sendPlaybackState() error {
	msg := WSServerMessage{
		Type:        "playback_state",
		Scenario:    s.scenario,
		CurrentSeq:  s.currentIdx,
		TotalEvents: len(s.scenario.Events),
		IsPlaying:   s.isPlaying,
		Book:        s.engine.Snapshot(),
		AllTrades:   s.allTrades,
	}
	return s.conn.WriteJSON(msg)
}

func (s *Session) sendState(msgType string, stepTrades []orderbook.Trade, stepExp *matching.StepExplanation) error {
	total := 0
	if s.scenario != nil {
		total = len(s.scenario.Events)
	}

	msg := WSServerMessage{
		Type:            msgType,
		Scenario:        s.scenario,
		CurrentSeq:      s.currentIdx,
		TotalEvents:     total,
		IsPlaying:       s.isPlaying,
		Book:            s.engine.Snapshot(),
		Trades:          stepTrades,
		AllTrades:       s.allTrades,
		Explanation:     stepExp,
		AllExplanations: s.explanations,
	}
	return s.conn.WriteJSON(msg)
}

func handleLabWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WS upgrade error: %v", err)
		return
	}
	defer conn.Close()

	session := newSession(conn)
	// Auto-load scenario 1 by default
	_ = session.loadScenario("scenario_1")

	for {
		var req WSClientMessage
		err := conn.ReadJSON(&req)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WS read error: %v", err)
			}
			session.stopPlay()
			break
		}

		session.mu.Lock()
		switch req.Type {
		case "load_scenario":
			_ = session.loadScenario(req.ScenarioID)
		case "step":
			_ = session.step()
		case "reset":
			session.reset()
		case "jump_to":
			_ = session.jumpTo(req.Seq)
		case "play":
			session.startPlay(req.IntervalMs)
		case "pause":
			session.stopPlay()
			_ = session.sendPlaybackState()
		default:
			log.Printf("Unknown command type: %s", req.Type)
		}
		session.mu.Unlock()
	}
}

func handleScenariosREST(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	_ = json.NewEncoder(w).Encode(scenarios.GetScenarios())
}

func handleHealthREST(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "depthwise-matching-engine"})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/ws/lab", handleLabWS)
	mux.HandleFunc("/api/scenarios", handleScenariosREST)
	mux.HandleFunc("/api/health", handleHealthREST)

	port := ":8080"
	fmt.Printf("Depthwise matching engine server listening on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, mux))
}
