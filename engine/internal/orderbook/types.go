package orderbook

type OrderEvent struct {
	Seq   int    `json:"seq"`
	Type  string `json:"type"` // "new" | "cancel"
	ID    string `json:"id"`
	Side  string `json:"side,omitempty"` // "buy" | "sell" (empty for cancel)
	Price int    `json:"price,omitempty"`
	Qty   int    `json:"qty,omitempty"`
}

type Trade struct {
	BuyerID  string `json:"buyer_id"`
	SellerID string `json:"seller_id"`
	Price    int    `json:"price"`
	Qty      int    `json:"qty"`
}

type RestingOrder struct {
	ID  string `json:"id"`
	Qty int    `json:"qty"` // remaining quantity, not original
}

type BookSnapshot struct {
	Bids map[int][]RestingOrder `json:"bids"` // price -> orders in time priority order
	Asks map[int][]RestingOrder `json:"asks"`
}
