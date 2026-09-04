package scenarios

import (
	"depthwise/engine/internal/orderbook"
)

// ScenarioMeta describes a Learning Lab simulation scenario.
type ScenarioMeta struct {
	ID          string                 `json:"id"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Concepts    []string               `json:"concepts"`
	TotalEvents int                    `json:"total_events"`
	Events      []orderbook.OrderEvent `json:"events"`
}

// GetScenarios returns metadata for all available synthetic scenarios.
func GetScenarios() []ScenarioMeta {
	return []ScenarioMeta{
		{
			ID:          "scenario_1",
			Title:       "1. Basic Matching & Price-Time Priority",
			Description: "Demonstrates FIFO time-priority queueing at the same price, crossing the spread, partial fills, and cancellation handling for untouched vs partially-filled resting orders.",
			Concepts: []string{
				"Price-Time Priority (FIFO)",
				"Spread Crossing",
				"Partial Fills",
				"Resting Order Cancellation",
			},
			TotalEvents: len(Scenario1Events),
			Events:      Scenario1Events,
		},
		{
			ID:          "scenario_2",
			Title:       "2. Order-Flow Imbalance (OFI)",
			Description: "Demonstrates how sustained aggregate buying pressure (4-5x buy vs sell volume) drives upward price drift by exhausting resting asks and stepping bids higher without large individual block trades.",
			Concepts: []string{
				"Order Flow Imbalance (OFI)",
				"Upward Price Drift",
				"Ask Liquidity Exhaustion",
				"Bid Level Stepping",
				"Kyle's Lambda Price Impact",
			},
			TotalEvents: len(Scenario2Events),
			Events:      Scenario2Events,
		},
	}
}

// GetScenarioByID returns the scenario matching the given ID.
func GetScenarioByID(id string) *ScenarioMeta {
	for _, s := range GetScenarios() {
		if s.ID == id {
			return &s
		}
	}
	return nil
}
