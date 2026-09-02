import React from 'react';
import { Terminal, Activity, Cpu, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  connected: boolean;
  activeMode: 'lab' | 'live';
  onSelectMode: (mode: 'lab' | 'live') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ connected, activeMode, onSelectMode }) => {
  return (
    <header className="border-b border-border bg-canvas-surface sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 bg-mustard text-content flex items-center justify-center font-mono font-bold text-xs">
              DW
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm tracking-wider text-content">
                DEPTHWISE
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-mustard-subtle text-mustard-dark border border-mustard-border font-bold">
                v0.1
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Mode Selector */}
          <nav className="flex items-center space-x-1 bg-canvas-subtle p-0.5 border border-border">
            <button
              onClick={() => onSelectMode('lab')}
              className={`px-3 py-1 text-xs font-mono transition-colors flex items-center space-x-1.5 ${
                activeMode === 'lab'
                  ? 'bg-canvas-surface text-content font-bold border border-border-strong border-l-2 border-l-mustard'
                  : 'text-content-secondary hover:text-content border border-transparent'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-mustard" />
              <span>01 / LEARNING LAB</span>
            </button>
            <button
              onClick={() => onSelectMode('live')}
              className={`px-3 py-1 text-xs font-mono transition-colors flex items-center space-x-1.5 ${
                activeMode === 'live'
                  ? 'bg-canvas-surface text-content font-bold border border-border-strong border-l-2 border-l-mustard'
                  : 'text-content-disabled border border-transparent cursor-not-allowed opacity-60'
              }`}
              title="Live Pulse mode coming in next milestone"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>02 / LIVE PULSE</span>
              <span className="text-[9px] bg-canvas-dark text-content-muted px-1 py-0.2 border border-border">SOON</span>
            </button>
          </nav>
        </div>

        {/* Right: Telemetry & State */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-canvas-subtle border border-border text-content-secondary">
            <Cpu className="w-3.5 h-3.5 text-mustard" />
            <span>ENGINE:</span>
            <span className="text-content font-semibold">~330k ops/sec</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-canvas-subtle border border-border text-content-secondary">
            <ShieldCheck className="w-3.5 h-3.5 text-mustard" />
            <span>FIFO CORE</span>
          </div>

          <div className="flex items-center space-x-2 px-2.5 py-1 bg-canvas-surface border border-border">
            <span className={`h-2 w-2 ${connected ? 'bg-mustard animate-pulse' : 'bg-brightred'}`} />
            <span className={connected ? 'text-mustard font-bold' : 'text-brightred font-bold'}>
              {connected ? 'CORE CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};


