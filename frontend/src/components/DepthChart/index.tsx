import React, { useMemo } from 'react';
import { BookSnapshot } from '../../lib/types';
import { BarChart2 } from 'lucide-react';

interface DepthChartProps {
  book: BookSnapshot;
}

export const DepthChart: React.FC<DepthChartProps> = ({ book }) => {
  const { bidSteps, askSteps, maxCumulative, minPrice, maxPrice, bestBid, bestAsk } = useMemo(() => {
    // Process Bids: sorted descending by price (best bid first)
    const bidPrices = Object.keys(book.bids || {})
      .map(Number)
      .filter((p) => (book.bids[p] || []).length > 0)
      .sort((a, b) => b - a);

    let cumBid = 0;
    const bSteps: { price: number; cumulative: number }[] = [];
    for (const p of bidPrices) {
      const vol = (book.bids[p] || []).reduce((sum, o) => sum + o.qty, 0);
      cumBid += vol;
      bSteps.push({ price: p, cumulative: cumBid });
    }

    // Process Asks: sorted ascending by price (best ask first)
    const askPrices = Object.keys(book.asks || {})
      .map(Number)
      .filter((p) => (book.asks[p] || []).length > 0)
      .sort((a, b) => a - b);

    let cumAsk = 0;
    const aSteps: { price: number; cumulative: number }[] = [];
    for (const p of askPrices) {
      const vol = (book.asks[p] || []).reduce((sum, o) => sum + o.qty, 0);
      cumAsk += vol;
      aSteps.push({ price: p, cumulative: cumAsk });
    }

    const maxCum = Math.max(cumBid, cumAsk, 10);
    const allPrices = [...bidPrices, ...askPrices];
    const minP = allPrices.length > 0 ? Math.min(...allPrices) - 1 : 98;
    const maxP = allPrices.length > 0 ? Math.max(...allPrices) + 1 : 103;

    return {
      bidSteps: bSteps,
      askSteps: aSteps,
      maxCumulative: maxCum,
      minPrice: minP,
      maxPrice: maxP,
      bestBid: bidPrices.length > 0 ? bidPrices[0] : null,
      bestAsk: askPrices.length > 0 ? askPrices[0] : null,
    };
  }, [book]);

  const svgWidth = 460;
  const svgHeight = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const getX = (price: number) => {
    return padding.left + ((price - minPrice) / (maxPrice - minPrice || 1)) * chartWidth;
  };

  const getY = (cum: number) => {
    return padding.top + chartHeight - (cum / maxCumulative) * chartHeight;
  };

  // Build SVG Path for Bids (Step from right to left)
  const bidPath = useMemo(() => {
    if (bidSteps.length === 0) return '';
    let d = `M ${getX(bidSteps[0].price)} ${getY(0)}`;
    for (let i = 0; i < bidSteps.length; i++) {
      const pt = bidSteps[i];
      d += ` L ${getX(pt.price)} ${getY(pt.cumulative)}`;
      if (i < bidSteps.length - 1) {
        d += ` L ${getX(bidSteps[i + 1].price)} ${getY(pt.cumulative)}`;
      } else {
        d += ` L ${padding.left} ${getY(pt.cumulative)}`;
      }
    }
    d += ` L ${padding.left} ${padding.top + chartHeight} Z`;
    return d;
  }, [bidSteps, minPrice, maxPrice, maxCumulative]);

  // Build SVG Path for Asks (Step from left to right)
  const askPath = useMemo(() => {
    if (askSteps.length === 0) return '';
    let d = `M ${getX(askSteps[0].price)} ${getY(0)}`;
    for (let i = 0; i < askSteps.length; i++) {
      const pt = askSteps[i];
      d += ` L ${getX(pt.price)} ${getY(pt.cumulative)}`;
      if (i < askSteps.length - 1) {
        d += ` L ${getX(askSteps[i + 1].price)} ${getY(pt.cumulative)}`;
      } else {
        d += ` L ${padding.left + chartWidth} ${getY(pt.cumulative)}`;
      }
    }
    d += ` L ${padding.left + chartWidth} ${padding.top + chartHeight} Z`;
    return d;
  }, [askSteps, minPrice, maxPrice, maxCumulative]);

  return (
    <div className="bg-canvas-surface border border-border flex flex-col">
      <div className="px-4 py-2.5 border-b border-border bg-canvas-subtle flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-3.5 h-3.5 text-terracotta" />
          <h3 className="text-xs font-bold text-content uppercase tracking-wider font-mono">
            03 / CUMULATIVE DEPTH SURFACE
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <span className="flex items-center space-x-1 text-terracotta-dark">
            <span className="w-2 h-2 bg-terracotta inline-block" />
            <span className="font-bold">Bids</span>
          </span>
          <span className="flex items-center space-x-1 text-burgundy">
            <span className="w-2 h-2 bg-burgundy inline-block" />
            <span className="font-bold">Asks</span>
          </span>
        </div>
      </div>

      <div className="p-3 flex justify-center items-center">
        {bidSteps.length === 0 && askSteps.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-xs font-mono text-content-muted">
            No resting depth data
          </div>
        ) : (
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 select-none">
            <defs>
              <linearGradient id="bidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#AA784F" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#AA784F" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="askGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6B0C08" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6B0C08" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <line
                key={pct}
                x1={padding.left}
                y1={padding.top + chartHeight * (1 - pct)}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight * (1 - pct)}
                stroke="#DDD8CE"
                strokeDasharray="2 2"
              />
            ))}

            {/* Bid Polygon */}
            {bidPath && (
              <path d={bidPath} fill="url(#bidGrad)" stroke="#AA784F" strokeWidth="1.5" />
            )}

            {/* Ask Polygon */}
            {askPath && (
              <path d={askPath} fill="url(#askGrad)" stroke="#6B0C08" strokeWidth="1.5" />
            )}

            {/* Spread Divider Marker */}
            {bestBid !== null && bestAsk !== null && (
              <g>
                <line
                  x1={getX((bestBid + bestAsk) / 2)}
                  y1={padding.top}
                  x2={getX((bestBid + bestAsk) / 2)}
                  y2={padding.top + chartHeight}
                  stroke="#3A3F5F"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <text
                  x={getX((bestBid + bestAsk) / 2)}
                  y={padding.top - 5}
                  textAnchor="middle"
                  fill="#3A3F5F"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  Spread: ${(bestAsk - bestBid).toFixed(2)}
                </text>
              </g>
            )}

            {/* X-axis Price Labels */}
            {Array.from({ length: maxPrice - minPrice + 1 }, (_, i) => minPrice + i).map((p) => {
              const x = getX(p);
              if (x < padding.left || x > padding.left + chartWidth) return null;
              return (
                <text
                  key={p}
                  x={x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fill="#66625C"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ${p}
                </text>
              );
            })}

            {/* Y-axis Depth Labels */}
            <text
              x={padding.left - 6}
              y={padding.top + 10}
              textAnchor="end"
              fill="#66625C"
              fontSize="9"
              fontFamily="monospace"
            >
              {maxCumulative}
            </text>
            <text
              x={padding.left - 6}
              y={padding.top + chartHeight}
              textAnchor="end"
              fill="#66625C"
              fontSize="9"
              fontFamily="monospace"
            >
              0
            </text>
          </svg>
        )}
      </div>
    </div>
  );
};

export default DepthChart;

