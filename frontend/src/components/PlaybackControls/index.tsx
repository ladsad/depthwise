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
    <div className="bg-canvas-surface border border-border p-4 flex flex-col space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Scenario Metadata */}
        <div className="flex items-center space-x-3">
          <div className="px-2.5 py-1 bg-mustard-subtle border border-mustard-border text-mustard-dark font-mono text-xs font-bold uppercase tracking-wider">
            {scenario?.title ? `SCENARIO / ${scenario.title}` : 'SCENARIO / 01'}
          </div>
          <div className="text-xs text-content-secondary font-mono">
            SEQUENCE: <span className="text-content font-bold">{String(currentSeq).padStart(2, '0')}</span> / {String(totalEvents).padStart(2, '0')}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Reset Button */}
          <button
            onClick={onReset}
            className="p-1.5 bg-canvas-surface hover:bg-canvas-subtle text-content border border-border hover:border-content transition-colors"
            title="Reset to Sequence 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={() => (isPlaying ? onPause() : onPlay(speedMs))}
            disabled={isAtEnd && !isPlaying}
            className={`px-3 py-1.5 flex items-center space-x-1.5 text-xs font-mono font-bold transition-colors border ${
              isPlaying
                ? 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200'
                : isAtEnd
                ? 'bg-canvas-subtle text-content-disabled border-border cursor-not-allowed'
                : 'bg-mustard text-content border-mustard-dark hover:bg-[#CA8A04]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY AUTO</span>
              </>
            )}
          </button>

          {/* Step Tick Button */}
          <button
            onClick={onStep}
            disabled={isAtEnd || isPlaying}
            className={`px-3.5 py-1.5 flex items-center space-x-1 text-xs font-mono font-bold transition-colors border ${
              isAtEnd || isPlaying
                ? 'bg-canvas-subtle text-content-disabled border-border cursor-not-allowed'
                : 'bg-brightred text-white border-brightred hover:bg-brightred-dark'
            }`}
          >
            <span>STEP TICK</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center space-x-1 bg-canvas-subtle p-0.5 border border-border text-[11px] font-mono">
          <div className="flex items-center text-content-secondary px-1.5">
            <Gauge className="w-3.5 h-3.5 mr-1 text-mustard" />
            <span className="text-[10px] uppercase font-bold">SPEED</span>
          </div>
          {[
            { label: '0.5x', ms: 1200 },
            { label: '1x', ms: 700 },
            { label: '2x', ms: 350 },
            { label: 'FAST', ms: 120 },
          ].map((sp) => (
            <button
              key={sp.label}
              onClick={() => handleSpeedChange(sp.ms)}
              className={`px-2 py-0.5 transition-colors ${
                speedMs === sp.ms
                  ? 'bg-content text-canvas-surface font-bold border border-content'
                  : 'text-content-secondary hover:text-content border border-transparent'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrubber Progress Slider */}
      <div className="flex items-center space-x-3 pt-1 border-t border-border-light">
        <span className="text-[10px] font-mono text-content-muted shrink-0 uppercase">
          TICK 00
        </span>
        <input
          type="range"
          min="0"
          max={totalEvents}
          value={currentSeq}
          onChange={(e) => onJumpTo(Number(e.target.value))}
          className="w-full h-1.5 bg-border rounded-none appearance-none cursor-pointer"
        />
        <span className="text-[10px] font-mono text-content-secondary font-semibold shrink-0">
          {totalEvents > 0 ? `${Math.round((currentSeq / totalEvents) * 100)}%` : '0%'}
        </span>
      </div>
    </div>
  );
};

