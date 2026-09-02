package matching

import (
	"testing"
	"depthwise/engine/internal/scenarios"
)

func TestProcessStepScenario1(t *testing.T) {
	eng := NewEngine()

	var allTrades []any
	for _, ev := range scenarios.Scenario1Events {
		trades, exp := eng.ProcessStep(ev)
		if exp.Seq != ev.Seq {
			t.Errorf("expected seq %d, got %d", ev.Seq, exp.Seq)
		}
		if exp.EventID != ev.ID {
			t.Errorf("expected event id %s, got %s", ev.ID, exp.EventID)
		}
		for _, tr := range trades {
			allTrades = append(allTrades, tr)
		}
	}

	if len(allTrades) != len(scenarios.Scenario1ExpectedTrades) {
		t.Fatalf("expected %d total trades, got %d", len(scenarios.Scenario1ExpectedTrades), len(allTrades))
	}

	finalBook := eng.Snapshot()
	if len(finalBook.Asks) != 0 {
		t.Errorf("expected 0 asks, got %d", len(finalBook.Asks))
	}
	if len(finalBook.Bids[101]) != 1 || finalBook.Bids[101][0].ID != "B4" || finalBook.Bids[101][0].Qty != 5 {
		t.Errorf("unexpected bid book state: %+v", finalBook.Bids)
	}
}
