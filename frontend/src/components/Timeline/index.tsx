import React from 'react';
import { ScenarioMeta } from '../../lib/types';
import { ArrowRight, Check, XCircle, Zap, PlusCircle } from 'lucide-react';

interface TimelineProps {
  scenario: ScenarioMeta | null;
  currentSeq: number;
  onJumpTo: (seq: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ scenario, currentSeq, onJumpTo }) => {
  if (!scenario || !scenario.events || scenario.events.length === 0) return null;

  const getEventIcon = (ev: (typeof scenario.events)[0]) => {
    if (ev.type === 'cancel') {
      return <XCircle className="w-3.5 h-3.5 text-brightred" />;
    }
    if (ev.price === 101 && ev.side === 'buy' && ev.id === 'B3') {
      return <Zap className="w-3.5 h-3.5 text-mustard" />; // Spread crosser
    }
    if (ev.side === 'buy') {
      return <PlusCircle className="w-3.5 h-3.5 text-mustard" />;
    }
    return <PlusCircle className="w-3.5 h-3.5 text-brightred" />;
  };

  const getEventBadge = (ev: (typeof scenario.events)[0]) => {
    if (ev.type === 'cancel') {
      return { label: `Cancel ${ev.id}`, color: 'border-red-300 text-red-900 bg-red-100' };
    }
    if (ev.id === 'B2') {
      return { label: `B2 Queues #2`, color: 'border-amber-300 text-amber-900 bg-amber-50' };
    }
    if (ev.id === 'B3') {
      return { label: `Cross Spread ➔ S1`, color: 'border-amber-400 text-amber-950 bg-amber-100' };
    }
    if (ev.id === 'S2') {
      return { label: `Hits B2 (B1 gone)`, color: 'border-red-300 text-red-900 bg-red-50' };
    }
    if (ev.side === 'buy') {
      return { label: `${ev.id}: ${ev.qty}@$${ev.price}`, color: 'border-amber-300 text-amber-900 bg-amber-50' };
    }
    return { label: `${ev.id}: ${ev.qty}@$${ev.price}`, color: 'border-red-300 text-red-900 bg-red-50' };
  };

  return (
    <div className="bg-canvas-surface border border-border p-4 flex flex-col space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-mustard" />
          <h3 className="text-xs font-bold text-content uppercase tracking-wider font-mono">
            INTERACTIVE SEQUENCE TIMELINE (CLICK TO SCRUB)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-content-secondary">
          STEP <strong className="text-mustard-dark bg-mustard-subtle px-1.5 py-0.2 border border-mustard-border">{currentSeq}</strong> OF {scenario.events.length}
        </span>
      </div>

      {/* Horizontal Scrollable Step Nodes */}
      <div className="overflow-x-auto pb-2 pt-1">
        <div className="flex items-center space-x-2 min-w-max">
          {scenario.events.map((ev, index) => {
            const seqNum = index + 1;
            const isCompleted = seqNum <= currentSeq;
            const isActive = seqNum === currentSeq;
            const badge = getEventBadge(ev);

            return (
              <React.Fragment key={ev.seq}>
                <button
                  onClick={() => onJumpTo(seqNum)}
                  className={`group flex flex-col items-center p-2.5 border transition-colors text-left relative ${
                    isActive
                      ? 'bg-mustard-subtle border-2 border-mustard text-content z-10'
                      : isCompleted
                      ? 'bg-canvas-surface border-border hover:border-content text-content'
                      : 'bg-canvas-subtle border-border-light hover:border-border text-content-disabled opacity-60'
                  }`}
                  title={`Jump to Seq #${seqNum}: ${ev.type === 'cancel' ? `Cancel ${ev.id}` : `${ev.side} ${ev.qty} @ $${ev.price}`}`}
                >
                  {/* Top Row: Seq Index and Status */}
                  <div className="flex items-center space-x-1.5 mb-1.5 w-full justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 ${
                        isActive
                          ? 'bg-mustard text-content font-bold'
                          : isCompleted
                          ? 'bg-canvas-subtle text-content-secondary border border-border'
                          : 'bg-canvas-dark text-content-disabled'
                      }`}
                    >
                      #{String(seqNum).padStart(2, '0')}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getEventIcon(ev)}
                      {isCompleted && !isActive && (
                        <Check className="w-3 h-3 text-mustard ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Microstructure Action Label */}
                  <div
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 border transition-colors ${badge.color}`}
                  >
                    {badge.label}
                  </div>

                  {/* Order Details */}
                  <div className="text-[10px] font-mono text-content-secondary mt-1 font-semibold">
                    {ev.type === 'cancel' ? (
                      <span>Cancel {ev.id}</span>
                    ) : (
                      <span>
                        {ev.side?.toUpperCase()} {ev.qty} @ ${ev.price}
                      </span>
                    )}
                  </div>
                </button>

                {/* Connector Arrow */}
                {index < scenario.events.length - 1 && (
                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 ${
                      index < currentSeq - 1 ? 'text-mustard' : 'text-border'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;

