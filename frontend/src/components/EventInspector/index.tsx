import React from 'react';
import { StepExplanation, ScenarioMeta } from '../../lib/types';
import { Info, ArrowRight, CheckCircle2 } from 'lucide-react';

interface EventInspectorProps {
  explanation: StepExplanation | null;
  scenario: ScenarioMeta | null;
  currentSeq: number;
}

export const EventInspector: React.FC<EventInspectorProps> = ({
  explanation,
  scenario,
  currentSeq,
}) => {
  const currentEvent = scenario?.events && currentSeq > 0 ? scenario.events[currentSeq - 1] : null;

  if (!explanation || !currentEvent) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-center items-center text-center h-full min-h-[220px]">
        <Info className="w-8 h-8 text-slate-600 mb-2" />
        <h3 className="text-sm font-semibold text-slate-300 font-mono">Engine Event Inspector</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Click <span className="text-emerald-400 font-semibold font-mono">Step Tick</span> or <span className="text-cyan-400 font-semibold font-mono">Play</span> to execute the first event and inspect deterministic price-time priority in real-time.
        </p>
      </div>
    );
  }

  const getActionBadge = (action: StepExplanation['action']) => {
    switch (action) {
      case 'matched_full':
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">
            Full Match
          </span>
        );
      case 'matched_partial':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase">
            Partial Match & Rest
          </span>
        );
      case 'rested':
        return (
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold uppercase">
            Rested In Book
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold uppercase">
            Order Cancelled
          </span>
        );
      case 'cancel_rejected':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold uppercase">
            Cancel Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col space-y-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
            Event #{explanation.seq}
          </span>
          <span className="text-xs font-mono text-slate-300">
            ID: <span className="font-bold text-white">{explanation.event_id}</span>
          </span>
        </div>
        <div>{getActionBadge(explanation.action)}</div>
      </div>

      {/* Raw Event Card */}
      <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/60 font-mono text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              currentEvent.type === 'cancel'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : currentEvent.side === 'buy'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {currentEvent.type === 'cancel' ? 'CANCEL' : `${currentEvent.side} LIMIT`}
          </span>
          <span className="text-slate-300">
            {currentEvent.type === 'cancel' ? (
              <>Cancel remaining of order <strong className="text-white">{currentEvent.id}</strong></>
            ) : (
              <>
                <strong className="text-white">{currentEvent.qty}</strong> units @ <strong className="text-cyan-400">${currentEvent.price}</strong>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="text-xs text-slate-200 font-sans leading-relaxed bg-slate-800/30 p-2.5 rounded-lg border border-slate-700/40">
        <p className="font-medium">{explanation.summary}</p>
      </div>

      {/* Microstructure Details */}
      {explanation.details && explanation.details.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
            Microstructure Mechanics:
          </div>
          <ul className="space-y-1">
            {explanation.details.map((detail, idx) => (
              <li key={idx} className="text-xs font-mono text-slate-300 flex items-start space-x-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Matched Trades in this step */}
      {explanation.trades && explanation.trades.length > 0 && (
        <div className="mt-auto pt-2 border-t border-slate-800/60">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Executed Matches in this Tick:</span>
          </div>
          <div className="space-y-1">
            {explanation.trades.map((tr, idx) => (
              <div
                key={idx}
                className="bg-emerald-950/30 border border-emerald-800/40 rounded p-1.5 text-xs font-mono flex items-center justify-between text-emerald-300"
              >
                <span>
                  Match #{idx + 1}: {tr.buyer_id} (Buy) ⟷ {tr.seller_id} (Sell)
                </span>
                <span className="font-bold">
                  {tr.qty} @ ${tr.price} (${tr.qty * tr.price})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
