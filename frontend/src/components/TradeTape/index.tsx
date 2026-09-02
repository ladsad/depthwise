import React from 'react';
import { Trade } from '../../lib/types';
import { TrendingUp, Clock } from 'lucide-react';

interface TradeTapeProps {
  trades: Trade[];
}

export const TradeTape: React.FC<TradeTapeProps> = ({ trades }) => {
  return (
    <div className="bg-canvas-surface border border-border flex flex-col h-full">
      {/* Structural Header */}
      <div className="px-4 py-2.5 border-b border-border bg-canvas-subtle flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-3.5 h-3.5 text-bid" />
          <h2 className="text-xs font-bold text-content uppercase tracking-wider font-mono">
            02 / TRADE EXECUTION TAPE
          </h2>
        </div>
        <span className="text-[10px] text-accent-primary font-mono bg-purple-50 px-2 py-0.5 border border-purple-200 font-bold">
          {trades.length} EXECUTED
        </span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 px-4 py-1.5 text-[11px] font-mono text-content-secondary border-b border-border-light bg-canvas-subtle/50">
        <div className="col-span-2">#</div>
        <div className="col-span-3">PRICE ($)</div>
        <div className="col-span-3 text-right">SIZE</div>
        <div className="col-span-4 text-right">PARTIES (BUY ➔ SELL)</div>
      </div>

      {/* Tape Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-light p-2 min-h-[160px] max-h-[300px]">
        {trades.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-content-muted flex flex-col items-center justify-center">
            <Clock className="w-5 h-5 mb-1.5 text-content-disabled" />
            <span>No trades executed yet</span>
          </div>
        ) : (
          [...trades].reverse().map((trade, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 px-2 py-1.5 text-xs font-mono items-center hover:bg-canvas-subtle transition-colors"
            >
              <div className="col-span-2 text-content-secondary font-semibold">
                #{String(trades.length - idx).padStart(2, '0')}
              </div>
              <div className="col-span-3 font-bold text-emerald-700">
                ${trade.price.toFixed(2)}
              </div>
              <div className="col-span-3 text-right font-bold text-content">
                {trade.qty}
              </div>
              <div className="col-span-4 text-right text-[11px] flex items-center justify-end space-x-1">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-1 py-0.2">
                  {trade.buyer_id}
                </span>
                <span className="text-content-muted font-bold">➔</span>
                <span className="bg-rose-50 text-rose-800 border border-rose-300 font-bold px-1 py-0.2">
                  {trade.seller_id}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

