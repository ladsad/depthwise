import React, { useMemo, useState } from 'react';
import { BookHistoryPoint } from '../../lib/ws-client';
import { Flame, TrendingUp, HelpCircle } from 'lucide-react';

interface HeatmapProps {
  bookHistory: BookHistoryPoint[];
  currentSeq: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ bookHistory, currentSeq }) => {
  const [hoveredCell, setHoveredCell] = useState<{ price: number; seq: number; qty: number; side: string; tradesCount: number } | null>(null);

  // Determine price range across all history points
  const { minPrice, maxPrice, priceLevels, maxVolume } = useMemo(() => {
    let minP = 99;
    let maxP = 104;
    let maxVol = 1;

    for (const pt of bookHistory) {
      for (const [pStr, orders] of Object.entries(pt.book.bids || {})) {
        const p = Number(pStr);
        const vol = (orders || []).reduce((sum, o) => sum + o.qty, 0);
        if (vol > 0) {
          minP = Math.min(minP, p);
          maxP = Math.max(maxP, p);
          maxVol = Math.max(maxVol, vol);
        }
      }
      for (const [pStr, orders] of Object.entries(pt.book.asks || {})) {
        const p = Number(pStr);
        const vol = (orders || []).reduce((sum, o) => sum + o.qty, 0);
        if (vol > 0) {
          minP = Math.min(minP, p);
          maxP = Math.max(maxP, p);
          maxVol = Math.max(maxVol, vol);
        }
      }
    }

    minP = Math.max(97, minP - 1);
    maxP = Math.min(106, maxP + 1);

    const levels: number[] = [];
    for (let p = maxP; p >= minP; p--) {
      levels.push(p);
    }

    return { minPrice: minP, maxPrice: maxP, priceLevels: levels, maxVolume: Math.max(maxVol, 15) };
  }, [bookHistory]);

  const cellHeight = 22;

  return (
    <div className="bg-canvas-surface border border-border flex flex-col shadow-none">
      {/* Structural Header */}
      <div className="px-4 py-2.5 border-b border-border bg-canvas-subtle flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flame className="w-3.5 h-3.5 text-terracotta" />
          <h2 className="text-xs font-bold text-content uppercase tracking-wider font-mono">
            03 / DEPTH-OVER-TIME WATERFALL &bull; BOOKMAP SURFACE
          </h2>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono text-content-secondary">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2 bg-terracotta inline-block" />
            <span>Bid Liquidity Density</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2 bg-burgundy inline-block" />
            <span>Ask Liquidity Density</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-navy inline-block" />
            <span>Mid Price Trajectory</span>
          </span>
        </div>
      </div>

      <div className="p-3 overflow-x-auto">
        <div className="min-w-[600px] select-none">
          {/* Main Matrix Grid */}
          <div className="relative border border-border bg-canvas-surface">
            {/* Price Level Rows */}
            {priceLevels.map((price) => {
              return (
                <div key={price} className="flex items-center border-b border-border-light last:border-b-0 h-[22px]">
                  {/* Y-Axis Label */}
                  <div className="w-14 shrink-0 px-2 text-[10px] font-mono font-bold text-content-secondary border-r border-border bg-canvas-subtle flex items-center justify-between">
                    <span>${price}</span>
                  </div>

                  {/* Horizontal Ticks / Sequence Columns */}
                  <div className="flex-1 flex h-full">
                    {bookHistory.map((pt) => {
                      const bidOrders = pt.book.bids?.[price] || [];
                      const askOrders = pt.book.asks?.[price] || [];
                      const bidQty = bidOrders.reduce((sum, o) => sum + o.qty, 0);
                      const askQty = askOrders.reduce((sum, o) => sum + o.qty, 0);
                      const isCurrent = pt.seq === currentSeq;

                      // Determine cell styling based on resting volume
                      let bgStyle = 'transparent';
                      let side = 'none';
                      let qty = 0;

                      if (bidQty > 0) {
                        const alpha = 0.15 + (bidQty / maxVolume) * 0.75;
                        bgStyle = `rgba(170, 120, 79, ${alpha.toFixed(2)})`;
                        side = 'bid';
                        qty = bidQty;
                      } else if (askQty > 0) {
                        const alpha = 0.15 + (askQty / maxVolume) * 0.75;
                        bgStyle = `rgba(107, 12, 8, ${alpha.toFixed(2)})`;
                        side = 'ask';
                        qty = askQty;
                      }

                      // Check if a trade occurred at this exact price level during this tick
                      const matchedAtLevel = (pt.trades || []).filter((t) => t.price === price);
                      const tradeVol = matchedAtLevel.reduce((sum, t) => sum + t.qty, 0);

                      return (
                        <div
                          key={pt.seq}
                          className={`flex-1 h-full border-r border-border-light relative flex items-center justify-center transition-all cursor-crosshair ${
                            isCurrent ? 'ring-1 ring-content z-10' : ''
                          }`}
                          style={{ backgroundColor: bgStyle }}
                          onMouseEnter={() =>
                            setHoveredCell({
                              price,
                              seq: pt.seq,
                              qty,
                              side,
                              tradesCount: tradeVol,
                            })
                          }
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {/* Trade Execution Dot Marker */}
                          {tradeVol > 0 && (
                            <div
                              className="h-2 w-2 rounded-full bg-content ring-2 ring-canvas-surface shadow-sm z-20"
                              title={`Trade Executed: ${tradeVol} shares @ $${price}`}
                            />
                          )}

                          {/* Cell Quantity Label (if width permits) */}
                          {qty > 0 && (
                            <span
                              className={`text-[8px] font-mono font-bold leading-none ${
                                (side === 'bid' && qty > 8) || (side === 'ask' && qty > 8)
                                  ? 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]'
                                  : 'text-content'
                              }`}
                            >
                              {qty}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Price Line Trajectory Overlay across ticks */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full"
              style={{ paddingLeft: '56px' }}
            >
              {bookHistory.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#3A3F5F"
                  strokeWidth="2"
                  points={bookHistory
                    .map((pt, idx) => {
                      if (pt.midPrice === null) return null;
                      const xPct = (idx + 0.5) * (100 / bookHistory.length);
                      const yNorm = (maxPrice - pt.midPrice) / (maxPrice - minPrice || 1);
                      const yPx = yNorm * (priceLevels.length * cellHeight);
                      return `${xPct}%,${yPx}`;
                    })
                    .filter(Boolean)
                    .join(' ')}
                />
              )}
            </svg>
          </div>

          {/* X-Axis Sequence Tick Labels */}
          <div className="flex border-t border-border mt-1 pt-1 font-mono text-[9px] text-content-secondary pl-14">
            {bookHistory.map((pt) => (
              <div
                key={pt.seq}
                className={`flex-1 text-center font-bold ${
                  pt.seq === currentSeq ? 'text-burgundy' : 'text-content-muted'
                }`}
              >
                T{pt.seq}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Tooltip Bar */}
        <div className="mt-2.5 px-3 py-1.5 bg-canvas-subtle border border-border text-[10px] font-mono flex items-center justify-between text-content-secondary">
          {hoveredCell ? (
            <div className="flex items-center space-x-4">
              <span>
                Coordinate: <strong className="text-content">T{hoveredCell.seq} &bull; ${hoveredCell.price}</strong>
              </span>
              <span>
                Resting Volume:{' '}
                <strong className={hoveredCell.side === 'bid' ? 'text-terracotta-dark' : hoveredCell.side === 'ask' ? 'text-burgundy' : 'text-content'}>
                  {hoveredCell.qty > 0 ? `${hoveredCell.qty} units (${hoveredCell.side.toUpperCase()})` : '0 (Empty)'}
                </strong>
              </span>
              {hoveredCell.tradesCount > 0 && (
                <span className="text-content font-bold bg-terracotta-light px-1.5 py-0.2 border border-terracotta-border">
                  &bull; Executed Matches: {hoveredCell.tradesCount} shares
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-content-muted">
              <HelpCircle className="w-3 h-3 text-content-muted" />
              <span>Hover over any cell on the waterfall surface to inspect resting depth and trade execution prints.</span>
            </div>
          )}

          <div className="flex items-center space-x-1 text-[9px] text-content-muted">
            <TrendingUp className="w-3 h-3 text-navy" />
            <span>Blue line tracks real-time inside mid-price drift</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Heatmap;
