import { useState, useEffect, useRef, useCallback } from 'react';
import { WSServerMessage, WSClientMessage, BookSnapshot, Trade, StepExplanation, ScenarioMeta, OFIMetric } from './types';

export interface BookHistoryPoint {
  seq: number;
  book: BookSnapshot;
  trades: Trade[];
  ofi?: OFIMetric;
  bestBid: number | null;
  bestAsk: number | null;
  midPrice: number | null;
}

export interface UseLabEngineReturn {
  connected: boolean;
  scenario: ScenarioMeta | null;
  allScenarios: ScenarioMeta[];
  currentSeq: number;
  totalEvents: number;
  isPlaying: boolean;
  book: BookSnapshot;
  allTrades: Trade[];
  latestTrades: Trade[];
  currentExplanation: StepExplanation | null;
  allExplanations: StepExplanation[];
  ofi: OFIMetric | null;
  ofiHistory: OFIMetric[];
  bookHistory: BookHistoryPoint[];
  error: string | null;
  loadScenario: (id: string) => void;
  step: () => void;
  reset: () => void;
  jumpTo: (seq: number) => void;
  play: (intervalMs?: number) => void;
  pause: () => void;
}

function calculateBBO(book: BookSnapshot) {
  const bidPrices = Object.keys(book.bids || {}).map(Number).filter((p) => (book.bids[p] || []).length > 0);
  const askPrices = Object.keys(book.asks || {}).map(Number).filter((p) => (book.asks[p] || []).length > 0);
  const bestBid = bidPrices.length > 0 ? Math.max(...bidPrices) : null;
  const bestAsk = askPrices.length > 0 ? Math.min(...askPrices) : null;
  const midPrice = bestBid !== null && bestAsk !== null ? (bestBid + bestAsk) / 2 : bestBid ?? bestAsk ?? null;
  return { bestBid, bestAsk, midPrice };
}

export function useLabEngine(wsUrl: string = 'ws://localhost:8080/ws/lab'): UseLabEngineReturn {
  const [connected, setConnected] = useState(false);
  const [scenario, setScenario] = useState<ScenarioMeta | null>(null);
  const [allScenarios, setAllScenarios] = useState<ScenarioMeta[]>([]);
  const [currentSeq, setCurrentSeq] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [book, setBook] = useState<BookSnapshot>({ bids: {}, asks: {} });
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [latestTrades, setLatestTrades] = useState<Trade[]>([]);
  const [currentExplanation, setCurrentExplanation] = useState<StepExplanation | null>(null);
  const [allExplanations, setAllExplanations] = useState<StepExplanation[]>([]);
  const [ofi, setOfi] = useState<OFIMetric | null>(null);
  const [ofiHistory, setOfiHistory] = useState<OFIMetric[]>([]);
  const [bookHistory, setBookHistory] = useState<BookHistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  // Fetch available scenarios on mount
  useEffect(() => {
    fetch('http://localhost:8080/api/scenarios')
      .then((res) => res.json())
      .then((data: ScenarioMeta[]) => {
        if (Array.isArray(data)) {
          setAllScenarios(data);
        }
      })
      .catch((err) => console.log('Could not fetch scenarios via REST (will use WS):', err));
  }, []);

  const sendMessage = useCallback((msg: WSClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          setError(null);
        };

        ws.onclose = () => {
          setConnected(false);
          reconnectTimer = setTimeout(connect, 2000);
        };

        ws.onerror = (e) => {
          console.error('WebSocket connection error:', e);
          setConnected(false);
        };

        ws.onmessage = (event) => {
          try {
            const data: WSServerMessage = JSON.parse(event.data);
            if (data.scenario) setScenario(data.scenario);
            setCurrentSeq(data.current_seq);
            setTotalEvents(data.total_events);
            setIsPlaying(data.is_playing);
            if (data.book) setBook(data.book);
            if (data.all_trades) setAllTrades(data.all_trades);
            if (data.trades) setLatestTrades(data.trades);
            if (data.explanation) setCurrentExplanation(data.explanation);
            if (data.all_explanations) setAllExplanations(data.all_explanations);
            if (data.ofi) setOfi(data.ofi);
            if (data.ofi_history) setOfiHistory(data.ofi_history);
            if (data.error_message) setError(data.error_message);

            // Maintain chronological book history snapshots for the Depth Waterfall Heatmap
            if (data.book) {
              const bbo = calculateBBO(data.book);
              if (data.type === 'scenario_loaded') {
                setBookHistory([
                  {
                    seq: 0,
                    book: data.book,
                    trades: [],
                    ofi: data.ofi,
                    ...bbo,
                  },
                ]);
              } else if (data.type === 'step_result') {
                setBookHistory((prev) => {
                  const filtered = prev.filter((p) => p.seq < data.current_seq);
                  return [
                    ...filtered,
                    {
                      seq: data.current_seq,
                      book: data.book,
                      trades: data.trades || [],
                      ofi: data.ofi,
                      ...bbo,
                    },
                  ];
                });
              }
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };
      } catch (err) {
        console.error('WebSocket initialization error:', err);
        reconnectTimer = setTimeout(connect, 2000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.close();
      }
    };
  }, [wsUrl]);

  const loadScenario = useCallback((id: string) => {
    sendMessage({ type: 'load_scenario', scenario_id: id });
  }, [sendMessage]);

  const step = useCallback(() => {
    sendMessage({ type: 'step' });
  }, [sendMessage]);

  const reset = useCallback(() => {
    sendMessage({ type: 'reset' });
  }, [sendMessage]);

  const jumpTo = useCallback((seq: number) => {
    sendMessage({ type: 'jump_to', seq });
  }, [sendMessage]);

  const play = useCallback((intervalMs: number = 600) => {
    sendMessage({ type: 'play', interval_ms: intervalMs });
  }, [sendMessage]);

  const pause = useCallback(() => {
    sendMessage({ type: 'pause' });
  }, [sendMessage]);

  return {
    connected,
    scenario,
    allScenarios,
    currentSeq,
    totalEvents,
    isPlaying,
    book,
    allTrades,
    latestTrades,
    currentExplanation,
    allExplanations,
    ofi,
    ofiHistory,
    bookHistory,
    error,
    loadScenario,
    step,
    reset,
    jumpTo,
    play,
    pause,
  };
}
