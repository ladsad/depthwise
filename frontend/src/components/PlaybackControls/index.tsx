import React from 'react';
import { Play, Pause, RotateCcw, ChevronRight, Gauge } from 'lucide-react';
import { ScenarioMeta } from '../../lib/types';

interface PlaybackControlsProps {
  scenario: ScenarioMeta | null;
  currentSeq: number;
  totalEvents: number;
  isPlaying: boolean;
  onStep: () => void;
  onReset: () => void;
  onPlay: (intervalMs?: number) => void;
  onPause: () => void;
  onJumpTo: (seq: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  scenario,
  currentSeq,
  totalEvents,
  isPlaying,
  onStep,
  onReset,
  onPlay,
  onPause,
  onJumpTo,
}) => {
  const [speedMs, setSpeedMs] = React.useState<number>(700);

  const handleSpeedChange = (ms: number) => {
    setSpeedMs(ms);
    if (isPlaying) {
      onPlay(ms);
    }
  };

  const isAtEnd = totalEvents > 0 && currentSeq >= totalEvents;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Scenario Info */}
        <div className="flex items-center space-x-3">
          <div className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold">
            {scenario?.title || 'Scenario 1'}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Sequence: <span className="text-slate-100 font-bold">{currentSeq}</span> / {totalEvents}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Reset Button */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60 shadow-sm"
            title="Reset to Sequence 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={() => (isPlaying ? onPause() : onPlay(speedMs))}
            disabled={isAtEnd && !isPlaying}
            className={`px-3.5 py-2 rounded-lg flex items-center space-x-1.5 text-xs font-mono font-semibold transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : isAtEnd
                ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Auto</span>
              </>
            )}
          </button>

          {/* Step Button */}
          <button
            onClick={onStep}
            disabled={isAtEnd || isPlaying}
            className={`px-4 py-2 rounded-lg flex items-center space-x-1 text-xs font-mono font-bold transition-all ${
              isAtEnd || isPlaying
                ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 border border-emerald-500/50'
            }`}
          >
            <span>Step Tick</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          {[
            { label: '0.5x', ms: 1200 },
            { label: '1x', ms: 700 },
            { label: '2x', ms: 350 },
            { label: 'Fast', ms: 120 },
          ].map((sp) => (
            <button
              key={sp.label}
              onClick={() => handleSpeedChange(sp.ms)}
              className={`px-2 py-0.5 rounded transition-all ${
                speedMs === sp.ms
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrubber Progress Slider */}
      <div className="flex items-center space-x-3 pt-1">
        <input
          type="range"
          min="0"
          max={totalEvents}
          value={currentSeq}
          onChange={(e) => onJumpTo(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
        />
        <span className="text-[10px] font-mono text-slate-400 shrink-0">
          {totalEvents > 0 ? `${Math.round((currentSeq / totalEvents) * 100)}%` : '0%'}
        </span>
      </div>
    </div>
  );
};
