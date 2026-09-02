import React, { useMemo } from 'react';
import { BookSnapshot } from '../../lib/types';
import { Layers, CornerDownRight } from 'lucide-react';

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
            Level-2 Order Book Ladder
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700/50">
          <CornerDownRight className="w-3.5 h-3.5 text-cyan-400" />
          <span>FIFO Queue Priority</span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-mono text-slate-400 border-b border-slate-800/50 bg-slate-950/20">
        <div className="col-span-3">Price Level ($)</div>
        <div className="col-span-2 text-right">Agg. Vol</div>
        <div className="col-span-7 pl-4">FIFO Queue Slots (1st ➔ 2nd ➔ ...)</div>
      </div>

      {/* Ladder Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/30 flex flex-col justify-between p-2 min-h-[320px]">
        {/* Asks Section */}
        <div className="space-y-1.5">
          {sortedAsks.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-slate-600 italic bg-slate-950/20 rounded-lg border border-slate-800/30">
              No resting asks in book (Ask liquidity empty)
            </div>
          ) : (
            sortedAsks.map(({ price, totalQty, orders }) => {
              const depthPct = (totalQty / maxVolume) * 100;
              const hasActiveOrder = orders.some((o) => o.id === latestEventID);

              return (
                <div
                  key={`ask-${price}`}
                  className={`relative grid grid-cols-12 px-2.5 py-2 rounded-lg text-xs font-mono items-center transition-all ${
                    hasActiveOrder ? 'bg-rose-950/40 ring-1 ring-rose-400/80 shadow-md shadow-rose-950/50' : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Depth Bar Background */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/10 rounded-r transition-all duration-300 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />

                  {/* Price */}
                  <div className="col-span-3 font-bold text-rose-400 z-10 flex items-center space-x-1.5">
                    <span>${price.toFixed(2)}</span>
                    <span className="text-[10px] text-rose-500/70 font-normal uppercase">Ask</span>
                  </div>

                  {/* Size */}
                  <div className="col-span-2 text-right font-bold text-slate-100 z-10">
                    {totalQty}
                  </div>

                  {/* FIFO Resting Queue Lane */}
                  <div className="col-span-7 pl-4 flex items-center space-x-1.5 overflow-x-auto z-10 py-0.5">
                    {orders.map((o, idx) => {
                      const isTarget = o.id === latestEventID;
                      return (
                        <div
                          key={o.id}
                          className={`flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                            isTarget
                              ? 'bg-rose-500/30 text-rose-100 border-rose-400 font-bold ring-2 ring-rose-500/40 scale-105'
                              : 'bg-slate-800/90 text-slate-200 border-slate-700/80'
                          }`}
                          title={`Queue Slot #${idx + 1} at price $${price} (Remaining: ${o.qty})`}
                        >
                          <span className="text-[9px] font-mono text-slate-400">#{idx + 1}</span>
                          <span className="font-bold text-rose-300">{o.id}</span>
                          <span className="text-slate-300 font-mono bg-slate-900/60 px-1 rounded">{o.qty}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Spread Divider / Collision Zone */}
        <div className="py-2.5 px-3.5 my-2 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 uppercase text-[10px] tracking-wider font-bold">Inside Spread:</span>
            {spread !== null ? (
              <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                ${spread.toFixed(2)}{' '}
                {bestBid && (
                  <span className="text-cyan-300/70 font-normal text-[11px]">
                    ({((spread / bestBid) * 10000).toFixed(0)} bps)
                  </span>
                )}
              </span>
            ) : (
              <span className="text-amber-400 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                1-Sided Market (Spread undefined)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-emerald-400 font-semibold">
              Bid: {bestBid !== null ? `$${bestBid.toFixed(2)}` : '—'}
            </span>
            <span className="text-slate-600">⟷</span>
            <span className="text-rose-400 font-semibold">
              Ask: {bestAsk !== null ? `$${bestAsk.toFixed(2)}` : '—'}
            </span>
          </div>
        </div>

        {/* Bids Section */}
        <div className="space-y-1.5">
          {sortedBids.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-slate-600 italic bg-slate-950/20 rounded-lg border border-slate-800/30">
              No resting bids in book (Bid liquidity empty)
            </div>
          ) : (
            sortedBids.map(({ price, totalQty, orders }) => {
              const depthPct = (totalQty / maxVolume) * 100;
              const hasActiveOrder = orders.some((o) => o.id === latestEventID);

              return (
                <div
                  key={`bid-${price}`}
                  className={`relative grid grid-cols-12 px-2.5 py-2 rounded-lg text-xs font-mono items-center transition-all ${
                    hasActiveOrder ? 'bg-emerald-950/40 ring-1 ring-emerald-400/80 shadow-md shadow-emerald-950/50' : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Depth Bar Background */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 rounded-r transition-all duration-300 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />

                  {/* Price */}
                  <div className="col-span-3 font-bold text-emerald-400 z-10 flex items-center space-x-1.5">
                    <span>${price.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-500/70 font-normal uppercase">Bid</span>
                  </div>

                  {/* Size */}
                  <div className="col-span-2 text-right font-bold text-slate-100 z-10">
                    {totalQty}
                  </div>

                  {/* FIFO Resting Queue Lane */}
                  <div className="col-span-7 pl-4 flex items-center space-x-1.5 overflow-x-auto z-10 py-0.5">
                    {orders.map((o, idx) => {
                      const isTarget = o.id === latestEventID;
                      return (
                        <div
                          key={o.id}
                          className={`flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                            isTarget
                              ? 'bg-emerald-500/30 text-emerald-100 border-emerald-400 font-bold ring-2 ring-emerald-500/40 scale-105'
                              : 'bg-slate-800/90 text-slate-200 border-slate-700/80'
                          }`}
                          title={`Queue Slot #${idx + 1} at price $${price} (Remaining: ${o.qty})`}
                        >
                          <span className="text-[9px] font-mono text-slate-400">#{idx + 1}</span>
                          <span className="font-bold text-emerald-300">{o.id}</span>
                          <span className="text-slate-300 font-mono bg-slate-900/60 px-1 rounded">{o.qty}</span>
                        </div>
                      );
                    })}
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
