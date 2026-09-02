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
      return <XCircle className="w-3.5 h-3.5 text-purple-400" />;
    }
    if (ev.price === 101 && ev.side === 'buy' && ev.id === 'B3') {
      return <Zap className="w-3.5 h-3.5 text-amber-400" />; // Spread crosser
    }
    if (ev.side === 'buy') {
      return <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <PlusCircle className="w-3.5 h-3.5 text-rose-400" />;
  };

  const getEventBadge = (ev: (typeof scenario.events)[0]) => {
    if (ev.type === 'cancel') {
      return { label: `Cancel ${ev.id}`, color: 'border-purple-500/40 text-purple-300 bg-purple-950/40' };
    }
    if (ev.id === 'B2') {
      return { label: `B2 Queues #2`, color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40' };
    }
    if (ev.id === 'B3') {
      return { label: `Cross Spread ➔ S1`, color: 'border-amber-500/40 text-amber-300 bg-amber-950/40' };
    }
    if (ev.id === 'S2') {
      return { label: `Hits B2 (B1 gone)`, color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' };
    }
    return { label: `${ev.id}: ${ev.qty}@$${ev.price}`, color: 'border-slate-700 text-slate-300 bg-slate-900/60' };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Interactive Sequence Timeline (Click to Time-Travel)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Step <strong className="text-cyan-400">{currentSeq}</strong> of {scenario.events.length}
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
                  className={`group flex flex-col items-center p-2.5 rounded-xl border transition-all text-left relative ${
                    isActive
                      ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/50 scale-105 z-10'
                      : isCompleted
                      ? 'bg-slate-950/60 border-slate-700 hover:border-slate-500 text-slate-300'
                      : 'bg-slate-950/30 border-slate-800/80 hover:border-slate-700 text-slate-500 opacity-70'
                  }`}
                  title={`Jump to Seq #${seqNum}: ${ev.type === 'cancel' ? `Cancel ${ev.id}` : `${ev.side} ${ev.qty} @ $${ev.price}`}`}
                >
                  {/* Top Row: Seq Index and Status */}
                  <div className="flex items-center space-x-1.5 mb-1.5 w-full justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950'
                          : isCompleted
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      #{seqNum}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getEventIcon(ev)}
                      {isCompleted && !isActive && (
                        <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Microstructure Action Label */}
                  <div
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border transition-colors ${badge.color}`}
                  >
                    {badge.label}
                  </div>

                  {/* Order Details */}
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
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
                      index < currentSeq - 1 ? 'text-cyan-500/60' : 'text-slate-700'
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
