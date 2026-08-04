package orderbook

type OrderEvent struct {
	Seq   int
	Type  string // "new" | "cancel"
	ID    string
	Side  string // "buy" | "sell" (empty for cancel)
	Price int    // ignored for cancel
	Qty   int    // ignored for cancel
}

type Trade struct {
	BuyerID  string
	SellerID string
	Price    int
	Qty      int
}

type RestingOrder struct {
	ID  string
	Qty int // remaining quantity, not original
}

type BookSnapshot struct {
	Bids map[int][]RestingOrder // price -> orders in time priority order
	Asks map[int][]RestingOrder
}
