import React, { useMemo } from 'react';
import { BookSnapshot } from '../../lib/types';
import { Layers } from 'lucide-react';

interface OrderBookProps {
  book: BookSnapshot;
  latestEventID?: string;
}

export const OrderBook: React.FC<OrderBookProps> = ({ book, latestEventID }) => {
  // Sort Asks ascending (lowest ask at bottom, closest to spread)
  const sortedAsks = useMemo(() => {
    const askPrices = Object.keys(book.asks || {})
      .map(Number)
      .filter((p) => (book.asks[p] || []).length > 0)
      .sort((a, b) => b - a); // high to low so lowest ask is near spread

    return askPrices.map((price) => {
      const orders = book.asks[price] || [];
      const totalQty = orders.reduce((sum, o) => sum + o.qty, 0);
      return { price, totalQty, orders };
    });
  }, [book.asks]);

  // Sort Bids descending (highest bid at top, closest to spread)
  const sortedBids = useMemo(() => {
    const bidPrices = Object.keys(book.bids || {})
      .map(Number)
      .filter((p) => (book.bids[p] || []).length > 0)
      .sort((a, b) => b - a); // high to low so highest bid is near spread

    return bidPrices.map((price) => {
      const orders = book.bids[price] || [];
      const totalQty = orders.reduce((sum, o) => sum + o.qty, 0);
      return { price, totalQty, orders };
    });
  }, [book.bids]);

  // Max volume across levels for proportional depth bars
  const maxVolume = useMemo(() => {
    const askMax = sortedAsks.reduce((max, a) => Math.max(max, a.totalQty), 0);
    const bidMax = sortedBids.reduce((max, b) => Math.max(max, b.totalQty), 0);
    return Math.max(askMax, bidMax, 1);
  }, [sortedAsks, sortedBids]);

  // Spread calculation
  const bestBid = sortedBids.length > 0 ? sortedBids[0].price : null;
  const bestAsk = sortedAsks.length > 0 ? sortedAsks[sortedAsks.length - 1].price : null;
  const spread = bestBid !== null && bestAsk !== null ? bestAsk - bestBid : null;

  return (
    <div className="bg-canvas-surface border border-border flex flex-col h-full">
      {/* Structural Header */}
      <div className="px-4 py-2.5 border-b border-border bg-canvas-subtle flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-terracotta" />
          <h2 className="text-xs font-bold text-content uppercase tracking-wider font-mono">
            01 / LEVEL-2 ORDER BOOK
          </h2>
        </div>
        <span className="text-[10px] text-terracotta-dark font-mono bg-terracotta-subtle px-2 py-0.5 border border-terracotta-border font-bold">
          FIFO PRIORITY
        </span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 px-4 py-1.5 text-[11px] font-mono text-content-secondary border-b border-border-light bg-canvas-subtle/50">
        <div className="col-span-3">PRICE ($)</div>
        <div className="col-span-3 text-right">SIZE</div>
        <div className="col-span-6 pl-4">RESTING QUEUE (FIFO)</div>
      </div>

      {/* Ladder Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-light flex flex-col justify-between p-2 min-h-[300px]">
        {/* Asks Section (Sell Side) */}
        <div className="space-y-0.5">
          {sortedAsks.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-content-muted italic">
              No resting asks in book
            </div>
          ) : (
            sortedAsks.map(({ price, totalQty, orders }) => {
              const depthPct = (totalQty / maxVolume) * 100;
              const hasActiveOrder = orders.some((o) => o.id === latestEventID);

              return (
                <div
                  key={`ask-${price}`}
                  className={`relative grid grid-cols-12 px-2 py-1 text-xs font-mono items-center transition-colors ${
                    hasActiveOrder ? 'bg-burgundy-subtle border-l-2 border-burgundy' : 'hover:bg-canvas-subtle'
                  }`}
                >
                  {/* Depth Bar Background */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#6B0C08]/10 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />

                  {/* Price */}
                  <div className="col-span-3 font-bold text-burgundy z-10">
                    ${price.toFixed(2)}
                  </div>

                  {/* Size */}
                  <div className="col-span-3 text-right font-bold text-content z-10">
                    {totalQty}
                  </div>

                  {/* FIFO Resting Queue Breakdown */}
                  <div className="col-span-6 pl-4 flex flex-wrap gap-1 z-10">
                    {orders.map((o, idx) => (
                      <span
                        key={o.id}
                        className={`text-[10px] px-1.5 py-0.2 border transition-colors ${
                          o.id === latestEventID
                            ? 'bg-burgundy-light text-burgundy-dark border-burgundy font-bold ring-1 ring-burgundy-border'
                            : 'bg-canvas-surface text-content-secondary border-border'
                        }`}
                        title={`Queue position #${idx + 1} at price $${price} (Remaining: ${o.qty})`}
                      >
                        <span className="text-burgundy font-bold">{o.id}</span>
                        <span className="text-content-muted ml-1">({o.qty})</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Spread Divider */}
        <div className="py-2 px-3 my-1 bg-canvas-subtle border-y border-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-content-secondary uppercase text-[10px] tracking-wider font-bold">SPREAD:</span>
            {spread !== null ? (
              <span className="font-bold text-navy-dark bg-navy-light px-1.5 py-0.2 border border-navy-border">
                ${spread.toFixed(2)}{' '}
                {bestBid && (
                  <span className="text-navy font-normal">
                    ({((spread / bestBid) * 10000).toFixed(0)} bps)
                  </span>
                )}
              </span>
            ) : (
              <span className="text-content-muted italic">Spread undefined (1-sided)</span>
            )}
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-terracotta-dark font-bold">
              BID: {bestBid !== null ? `$${bestBid.toFixed(2)}` : '—'}
            </span>
            <span className="text-border-strong">|</span>
            <span className="text-burgundy font-bold">
              ASK: {bestAsk !== null ? `$${bestAsk.toFixed(2)}` : '—'}
            </span>
          </div>
        </div>

        {/* Bids Section (Buy Side) */}
        <div className="space-y-0.5">
          {sortedBids.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-content-muted italic">
              No resting bids in book
            </div>
          ) : (
            sortedBids.map(({ price, totalQty, orders }) => {
              const depthPct = (totalQty / maxVolume) * 100;
              const hasActiveOrder = orders.some((o) => o.id === latestEventID);

              return (
                <div
                  key={`bid-${price}`}
                  className={`relative grid grid-cols-12 px-2 py-1 text-xs font-mono items-center transition-colors ${
                    hasActiveOrder ? 'bg-terracotta-subtle border-l-2 border-terracotta' : 'hover:bg-canvas-subtle'
                  }`}
                >
                  {/* Depth Bar Background */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#AA784F]/15 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />

                  {/* Price */}
                  <div className="col-span-3 font-bold text-terracotta-dark z-10">
                    ${price.toFixed(2)}
                  </div>

                  {/* Size */}
                  <div className="col-span-3 text-right font-bold text-content z-10">
                    {totalQty}
                  </div>

                  {/* FIFO Resting Queue Breakdown */}
                  <div className="col-span-6 pl-4 flex flex-wrap gap-1 z-10">
                    {orders.map((o, idx) => (
                      <span
                        key={o.id}
                        className={`text-[10px] px-1.5 py-0.2 border transition-colors ${
                          o.id === latestEventID
                            ? 'bg-terracotta-light text-terracotta-dark border-terracotta font-bold ring-1 ring-terracotta-border'
                            : 'bg-canvas-surface text-content-secondary border-border'
                        }`}
                        title={`Queue position #${idx + 1} at price $${price} (Remaining: ${o.qty})`}
                      >
                        <span className="text-terracotta-dark font-bold">{o.id}</span>
                        <span className="text-content-muted ml-1">({o.qty})</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;

