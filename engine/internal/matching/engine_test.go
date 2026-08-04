package matching

import (
	"math/rand"
	"reflect"
	"sync"
	"testing"
	"time"

	"depthwise/engine/internal/orderbook"
	"depthwise/engine/internal/scenarios"
)

func TestScenario1_BasicMatching(t *testing.T) {
	eventsCh := make(chan orderbook.OrderEvent, len(scenarios.Scenario1Events))
	tradesCh := make(chan orderbook.Trade, len(scenarios.Scenario1Events))

	engine := NewEngine()

	// Run engine in a goroutine
	go func() {
		engine.Run(eventsCh, tradesCh)
		close(tradesCh)
	}()

	// Send all events
	for _, ev := range scenarios.Scenario1Events {
		eventsCh <- ev
	}
	close(eventsCh)

	// Collect trades
	var actualTrades []orderbook.Trade
	for tr := range tradesCh {
		actualTrades = append(actualTrades, tr)
	}

	// Compare trades
	if !reflect.DeepEqual(actualTrades, scenarios.Scenario1ExpectedTrades) {
		t.Errorf("Trades mismatch.\nGot: %+v\nExpected: %+v", actualTrades, scenarios.Scenario1ExpectedTrades)
	}

	// Compare book snapshot
	actualBook := engine.Snapshot()
	
	// Normalize empty maps for deep equal
	if len(actualBook.Bids) == 0 && len(scenarios.Scenario1ExpectedBook.Bids) == 0 {
		actualBook.Bids = scenarios.Scenario1ExpectedBook.Bids
	}
	if len(actualBook.Asks) == 0 && len(scenarios.Scenario1ExpectedBook.Asks) == 0 {
		actualBook.Asks = scenarios.Scenario1ExpectedBook.Asks
	}

	if !reflect.DeepEqual(actualBook, scenarios.Scenario1ExpectedBook) {
		t.Errorf("Book mismatch.\nGot: %+v\nExpected: %+v", actualBook, scenarios.Scenario1ExpectedBook)
	}
}

func TestScenario1_ConcurrentCancelRace(t *testing.T) {
	eventsCh := make(chan orderbook.OrderEvent, 10)
	tradesCh := make(chan orderbook.Trade, 10)

	engine := NewEngine()

	// Run engine in a goroutine
	go func() {
		engine.Run(eventsCh, tradesCh)
		close(tradesCh)
	}()

	// Replay events 1-5 sequentially (up to the cancel of S1)
	for i := 0; i < 5; i++ {
		eventsCh <- scenarios.Scenario1Events[i]
	}

	// Give the engine a moment to process the initial sequential events
	time.Sleep(20 * time.Millisecond)

	// Now dispatch event 6 (cancel B1) and event 7 (new S2) from two separate goroutines simultaneously
	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		time.Sleep(time.Duration(rand.Intn(6)) * time.Millisecond)
		eventsCh <- scenarios.Scenario1Events[5] // seq 6: cancel B1
	}()

	go func() {
		defer wg.Done()
		time.Sleep(time.Duration(rand.Intn(6)) * time.Millisecond)
		eventsCh <- scenarios.Scenario1Events[6] // seq 7: new S2
	}()

	wg.Wait()
	
	// Ensure engine processes concurrent events
	time.Sleep(20 * time.Millisecond)
	close(eventsCh)

	var actualTrades []orderbook.Trade
	for tr := range tradesCh {
		actualTrades = append(actualTrades, tr)
	}

	expectedRaceTrade := orderbook.Trade{BuyerID: "B2", SellerID: "S2", Price: 100, Qty: 5}
	foundRaceTrade := false

	for _, tr := range actualTrades {
		if tr.BuyerID == "B1" {
			t.Fatalf("Data Race Bug Detected: B1 matched with S2 despite being cancelled first! (B1's cancel seq=6, S2's new seq=7). Trade: %+v", tr)
		}
		if reflect.DeepEqual(tr, expectedRaceTrade) {
			foundRaceTrade = true
		}
	}

	if !foundRaceTrade {
		t.Fatalf("Expected race trade %+v not found. Actual trades: %+v", expectedRaceTrade, actualTrades)
	}
}

