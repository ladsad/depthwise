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
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Level-2 Order Book
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
          Price-Time Priority (FIFO)
        </span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 px-4 py-1.5 text-[11px] font-mono text-slate-400 border-b border-slate-800/50 bg-slate-950/20">
        <div className="col-span-3">Price ($)</div>
        <div className="col-span-3 text-right">Size</div>
        <div className="col-span-6 pl-4">Resting Queue (FIFO)</div>
      </div>

      {/* Ladder Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/30 flex flex-col justify-between p-2 min-h-[300px]">
        {/* Asks Section */}
        <div className="space-y-1">
          {sortedAsks.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-slate-600 italic">
              No resting asks in book
            </div>
          ) : (
            sortedAsks.map(({ price, totalQty, orders }) => {
              const depthPct = (totalQty / maxVolume) * 100;
              const hasActiveOrder = orders.some((o) => o.id === latestEventID);

              return (
                <div
                  key={`ask-${price}`}
                  className={`relative grid grid-cols-12 px-2 py-1.5 rounded text-xs font-mono items-center transition-all ${
                    hasActiveOrder ? 'bg-rose-500/20 ring-1 ring-rose-500/40' : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Depth Bar Background */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/10 rounded-r transition-all duration-300 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />

                  {/* Price */}
                  <div className="col-span-3 font-semibold text-rose-400 z-10">
                    ${price.toFixed(2)}
                  </div>

                  {/* Size */}
                  <div className="col-span-3 text-right font-medium text-slate-200 z-10">
                    {totalQty}
                  </div>

                  {/* FIFO Resting Queue Breakdown */}
                  <div className="col-span-6 pl-4 flex flex-wrap gap-1 z-10">
                    {orders.map((o, idx) => (
                      <span
                        key={o.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${
                          o.id === latestEventID
                            ? 'bg-rose-500/30 text-rose-200 border-rose-400 font-bold'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                        }`}
                        title={`Queue position #${idx + 1} at price $${price} (Remaining: ${o.qty})`}
                      >
                        <span className="text-rose-400 font-semibold">{o.id}</span>
                        <span className="text-slate-400 ml-1">({o.qty})</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Spread Divider */}
        <div className="py-2.5 px-3 my-1.5 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 uppercase text-[10px] tracking-wider font-semibold">Spread:</span>
            {spread !== null ? (
              <span className="text-cyan-400 font-bold">
                ${spread.toFixed(2)}{' '}
                {bestBid && (
                  <span className="text-slate-500 font-normal">
                    ({((spread / bestBid) * 10000).toFixed(0)} bps)
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-600 italic">Spread undefined (1-sided)</span>
            )}
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-emerald-400">
              Best Bid: {bestBid !== null ? `$${bestBid.toFixed(2)}` : '—'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400">
              Best Ask: {bestAsk !== null ? `$${bestAsk.toFixed(2)}` : '—'}
            </span>
          </div>
        </div>

        {/* Bids Section */}
        <div className="space-y-1">
          {sortedBids.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-slate-600 italic">
              No resting bids in book
            </div>
          ) : (
            sortedBids.map(({ price, totalQty, orders }) => {
              const depthPct = (totalQty / maxVolume) * 100;
              const hasActiveOrder = orders.some((o) => o.id === latestEventID);

              return (
                <div
                  key={`bid-${price}`}
                  className={`relative grid grid-cols-12 px-2 py-1.5 rounded text-xs font-mono items-center transition-all ${
                    hasActiveOrder ? 'bg-emerald-500/20 ring-1 ring-emerald-500/40' : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Depth Bar Background */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 rounded-r transition-all duration-300 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />

                  {/* Price */}
                  <div className="col-span-3 font-semibold text-emerald-400 z-10">
                    ${price.toFixed(2)}
                  </div>

                  {/* Size */}
                  <div className="col-span-3 text-right font-medium text-slate-200 z-10">
                    {totalQty}
                  </div>

                  {/* FIFO Resting Queue Breakdown */}
                  <div className="col-span-6 pl-4 flex flex-wrap gap-1 z-10">
                    {orders.map((o, idx) => (
                      <span
                        key={o.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${
                          o.id === latestEventID
                            ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 font-bold'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                        }`}
                        title={`Queue position #${idx + 1} at price $${price} (Remaining: ${o.qty})`}
                      >
                        <span className="text-emerald-400 font-semibold">{o.id}</span>
                        <span className="text-slate-400 ml-1">({o.qty})</span>
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
