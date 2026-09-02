import React from 'react';
import { Trade } from '../../lib/types';
import { TrendingUp, Clock } from 'lucide-react';

interface TradeTapeProps {
  trades: Trade[];
}

export const TradeTape: React.FC<TradeTapeProps> = ({ trades }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Trade Execution Tape
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
          {trades.length} Executed
        </span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 px-4 py-1.5 text-[11px] font-mono text-slate-400 border-b border-slate-800/50 bg-slate-950/20">
        <div className="col-span-2">#</div>
        <div className="col-span-3">Price</div>
        <div className="col-span-3 text-right">Size</div>
        <div className="col-span-4 text-right">Parties (B ➔ S)</div>
      </div>

      {/* Tape Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/30 p-2 min-h-[160px] max-h-[300px]">
        {trades.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-600 flex flex-col items-center justify-center">
            <Clock className="w-6 h-6 mb-1 text-slate-700" />
            <span>No trades executed yet</span>
          </div>
        ) : (
          [...trades].reverse().map((trade, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 px-2 py-1.5 rounded text-xs font-mono items-center hover:bg-slate-800/40 transition-colors animate-fadeIn"
            >
              <div className="col-span-2 text-slate-500">
                #{trades.length - idx}
              </div>
              <div className="col-span-3 font-semibold text-emerald-400">
                ${trade.price.toFixed(2)}
              </div>
              <div className="col-span-3 text-right font-medium text-slate-200">
                {trade.qty}
              </div>
              <div className="col-span-4 text-right text-[11px] text-slate-400">
                <span className="text-emerald-400 font-medium">{trade.buyer_id}</span>
                <span className="mx-1 text-slate-600">⟷</span>
                <span className="text-rose-400 font-medium">{trade.seller_id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
