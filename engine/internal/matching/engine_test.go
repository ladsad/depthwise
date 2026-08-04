package matching

import (
	"reflect"
	"testing"

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
