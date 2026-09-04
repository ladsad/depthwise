package signal

import (
	"testing"
	"depthwise/engine/internal/orderbook"
)

func TestCalculateDelta_BidMechanics(t *testing.T) {
	// Case 1: Initial empty to bid added @ 100 Qty 10 -> delta = +10
	t0 := TopOfBook{}
	t1 := TopOfBook{HasBids: true, BestBidPrice: 100, BestBidQty: 10}
	if d := CalculateDelta(t0, t1); d != 10 {
		t.Errorf("expected delta +10, got %d", d)
	}

	// Case 2: Bid price unchanged @ 100, Qty increases from 10 to 15 -> delta = +5
	t2 := TopOfBook{HasBids: true, BestBidPrice: 100, BestBidQty: 15}
	if d := CalculateDelta(t1, t2); d != 5 {
		t.Errorf("expected delta +5, got %d", d)
	}

	// Case 3: Bid price ticks UP from 100 to 101 with Qty 8 -> delta = +8
	t3 := TopOfBook{HasBids: true, BestBidPrice: 101, BestBidQty: 8}
	if d := CalculateDelta(t2, t3); d != 8 {
		t.Errorf("expected delta +8, got %d", d)
	}

	// Case 4: Bid price ticks DOWN from 101 to 100 with Qty 15 -> delta = -8 (prev qty lost)
	if d := CalculateDelta(t3, t2); d != -8 {
		t.Errorf("expected delta -8, got %d", d)
	}
}

func TestCalculateDelta_AskMechanics(t *testing.T) {
	// Case 1: Initial ask added @ 102 Qty 10 -> delta = -10 (new sell resistance)
	t0 := TopOfBook{}
	t1 := TopOfBook{HasAsks: true, BestAskPrice: 102, BestAskQty: 10}
	if d := CalculateDelta(t0, t1); d != -10 {
		t.Errorf("expected delta -10, got %d", d)
	}

	// Case 2: Ask price unchanged @ 102, Qty decreases from 10 to 4 (consumed) -> delta = +6
	t2 := TopOfBook{HasAsks: true, BestAskPrice: 102, BestAskQty: 4}
	if d := CalculateDelta(t1, t2); d != 6 {
		t.Errorf("expected delta +6, got %d", d)
	}

	// Case 3: Ask price ticks UP from 102 to 103 (asks lifted, prev Qty 4 consumed) -> delta = +4
	t3 := TopOfBook{HasAsks: true, BestAskPrice: 103, BestAskQty: 12}
	if d := CalculateDelta(t2, t3); d != 4 {
		t.Errorf("expected delta +4, got %d", d)
	}

	// Case 4: Ask price ticks DOWN from 103 to 102 (sellers lower ask, Qty 4) -> delta = -4
	if d := CalculateDelta(t3, t2); d != -4 {
		t.Errorf("expected delta -4, got %d", d)
	}
}

func TestOFICalculator_WindowAndFlagging(t *testing.T) {
	calc := NewOFICalculator(5, 3.0, 10)

	// Balanced book start
	snap1 := orderbook.BookSnapshot{
		Bids: map[int][]orderbook.RestingOrder{100: {{ID: "B1", Qty: 10}}},
		Asks: map[int][]orderbook.RestingOrder{102: {{ID: "S1", Qty: 10}}},
	}
	m1 := calc.Update(snap1)
	if m1.Flagged {
		t.Errorf("expected initial balanced state not to be flagged")
	}

	// Inject sustained buy pressure: bids added at 100, ask at 102 lifted
	snap2 := orderbook.BookSnapshot{
		Bids: map[int][]orderbook.RestingOrder{100: {{ID: "B1", Qty: 10}, {ID: "B2", Qty: 15}}},
		Asks: map[int][]orderbook.RestingOrder{102: {{ID: "S1", Qty: 10}}},
	}
	m2 := calc.Update(snap2)
	if m2.DeltaOFI != 15 {
		t.Errorf("expected delta +15, got %d", m2.DeltaOFI)
	}

	// Lift ask to 103
	snap3 := orderbook.BookSnapshot{
		Bids: map[int][]orderbook.RestingOrder{100: {{ID: "B1", Qty: 10}, {ID: "B2", Qty: 15}}},
		Asks: map[int][]orderbook.RestingOrder{103: {{ID: "S2", Qty: 5}}},
	}
	m3 := calc.Update(snap3)
	if m3.DeltaOFI != 10 { // +10 because ask lifted from 102 (had 10) to 103
		t.Errorf("expected delta +10, got %d", m3.DeltaOFI)
	}

	// Check that ratio is flagged under strong buy flow
	if !m3.Flagged {
		t.Errorf("expected OFI to be flagged under sustained buy pressure")
	}
	if m3.Ratio < 3.0 {
		t.Errorf("expected ratio >= 3.0, got %f", m3.Ratio)
	}
}
