// Package evidence holds the Evidence struct — the data contract between the deterministic core and the LLM layer.
package evidence

import "time"

// Evidence is the structured data computed deterministically by the core engine.
// It is the only data passed to the LLM explanation layer.
type Evidence struct {
	Symbol      string    `json:"symbol"`
	Timestamp   time.Time `json:"timestamp"`
	MoveSizePct float64   `json:"move_size_pct"`
	Metrics     struct {
		VolatilityAdjustedMove struct {
			ZScore  float64 `json:"zscore"`
			Flagged bool    `json:"flagged"`
		} `json:"volatility_adjusted_move"`
		OrderFlowImbalance struct {
			Ratio   float64 `json:"ratio"`
			Flagged bool    `json:"flagged"`
		} `json:"order_flow_imbalance"`
		SpreadBehavior struct {
			WideningPct float64 `json:"widening_pct"`
			Flagged     bool    `json:"flagged"`
		} `json:"spread_behavior"`
		TradeSizeFootprint struct {
			LargestTradeSharePct float64 `json:"largest_trade_share_pct"`
			Flagged              bool    `json:"flagged"`
		} `json:"trade_size_footprint"`
	} `json:"metrics"`
	FlaggedCount int    `json:"flagged_count"` // how many of the 4 metrics flagged, 0-4
	Source       string `json:"source"`        // "synthetic" | "live"
	ScenarioID   string `json:"scenario_id,omitempty"` // present only in Lab mode
}
