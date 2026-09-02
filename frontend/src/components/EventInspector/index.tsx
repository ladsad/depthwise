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
      <div className="bg-canvas-surface border border-border p-6 flex flex-col justify-center items-center text-center h-full min-h-[220px]">
        <Info className="w-6 h-6 text-content-muted mb-2" />
        <h3 className="text-xs font-bold text-content uppercase tracking-wider font-mono">
          03 / EVENT INSPECTOR
        </h3>
        <p className="text-xs text-content-secondary max-w-xs mt-1.5 font-sans leading-relaxed">
          Execute a tick via <span className="font-mono font-semibold text-content">STEP TICK</span> or <span className="font-mono font-semibold text-content">PLAY</span> to inspect deterministic FIFO queue state and execution rationale.
        </p>
      </div>
    );
  }

  const getActionBadge = (action: StepExplanation['action']) => {
    switch (action) {
      case 'matched_full':
        return (
          <span className="px-2 py-0.5 bg-terracotta-subtle text-terracotta-dark border border-terracotta-border text-[10px] font-mono font-bold uppercase">
            [ FULL MATCH ]
          </span>
        );
      case 'matched_partial':
        return (
          <span className="px-2 py-0.5 bg-navy-light text-navy-dark border border-navy-border text-[10px] font-mono font-bold uppercase">
            [ PARTIAL MATCH & REST ]
          </span>
        );
      case 'rested':
        return (
          <span className="px-2 py-0.5 bg-canvas-subtle text-content border border-border-strong text-[10px] font-mono font-bold uppercase">
            [ RESTED IN BOOK ]
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 bg-burgundy-subtle text-burgundy border border-burgundy-border text-[10px] font-mono font-bold uppercase">
            [ CANCELLED ]
          </span>
        );
      case 'cancel_rejected':
        return (
          <span className="px-2 py-0.5 bg-burgundy-light text-burgundy-dark border border-burgundy text-[10px] font-mono font-bold uppercase">
            [ CANCEL REJECTED ]
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-canvas-surface border border-border p-4 flex flex-col space-y-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="font-bold text-terracotta-dark uppercase tracking-wider bg-terracotta-subtle px-2 py-0.5 border border-terracotta-border">
            03 / EVENT #{String(explanation.seq).padStart(2, '0')}
          </span>
          <span className="text-content-muted">|</span>
          <span className="text-content-secondary">
            ID: <span className="font-bold text-content">{explanation.event_id}</span>
          </span>
        </div>
        <div>{getActionBadge(explanation.action)}</div>
      </div>

      {/* Raw Event Banner */}
      <div className="bg-canvas-subtle p-2.5 border border-border font-mono text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`px-1.5 py-0.2 text-[10px] font-bold uppercase border ${
              currentEvent.type === 'cancel'
                ? 'bg-burgundy-subtle text-burgundy border-burgundy-border'
                : currentEvent.side === 'buy'
                ? 'bg-terracotta-subtle text-terracotta-dark border-terracotta-border'
                : 'bg-burgundy-subtle text-burgundy border-burgundy-border'
            }`}
          >
            {currentEvent.type === 'cancel' ? 'CANCEL' : `${currentEvent.side} LIMIT`}
          </span>
          <span className="text-content">
            {currentEvent.type === 'cancel' ? (
              <>Cancel order <strong className="text-content font-bold">{currentEvent.id}</strong></>
            ) : (
              <>
                <strong className="text-content font-bold">{currentEvent.qty}</strong> units @ <strong className="text-terracotta-dark bg-terracotta-subtle px-1.5 py-0.2 border border-terracotta-border">${currentEvent.price}</strong>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Summary with intentional left terracotta accent bar */}
      <div className="text-xs text-content font-sans leading-relaxed bg-terracotta-subtle/30 p-2.5 border border-border border-l-4 border-l-terracotta">
        <p className="font-medium text-content">{explanation.summary}</p>
      </div>

      {/* Microstructure Details */}
      {explanation.details && explanation.details.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-content-secondary font-bold">
            MECHANICS / ANALYSIS:
          </div>
          <ul className="space-y-1">
            {explanation.details.map((detail, idx) => (
              <li key={idx} className="text-xs font-mono text-content flex items-start space-x-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-terracotta shrink-0 mt-0.5" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Matched Trades in this step */}
      {explanation.trades && explanation.trades.length > 0 && (
        <div className="mt-auto pt-2 border-t border-border">
          <div className="text-[10px] uppercase font-mono tracking-wider text-terracotta-dark font-bold mb-1.5 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-terracotta" />
            <span>EXECUTED MATCHES IN TICK:</span>
          </div>
          <div className="space-y-1">
            {explanation.trades.map((tr, idx) => (
              <div
                key={idx}
                className="bg-terracotta-subtle border border-terracotta-border p-1.5 text-xs font-mono flex items-center justify-between text-content"
              >
                <span>
                  Match #{idx + 1}: <span className="font-bold text-terracotta-dark">{tr.buyer_id}</span> (Buy) ➔ <span className="font-bold text-burgundy">{tr.seller_id}</span> (Sell)
                </span>
                <span className="font-bold bg-canvas-surface px-1.5 py-0.2 border border-border">
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

