import React from 'react';
import { Activity, ShieldCheck, Terminal, Cpu } from 'lucide-react';

interface NavbarProps {
  connected: boolean;
  activeMode: 'lab' | 'live';
  onSelectMode: (mode: 'lab' | 'live') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ connected, activeMode, onSelectMode }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-mono font-bold text-white shadow-lg shadow-cyan-500/20 text-xs">
              DW
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white font-mono">
                  DEPTHWISE
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-semibold">
                  v0.1
                </span>
              </div>
            </div>
          </div>

          <nav className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => onSelectMode('lab')}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all ${
                activeMode === 'lab'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Learning Lab</span>
            </button>
            <button
              onClick={() => onSelectMode('live')}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all ${
                activeMode === 'live'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-500 hover:text-slate-400 cursor-not-allowed opacity-60'
              }`}
              title="Live Pulse mode coming in next milestone"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Pulse</span>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded uppercase">Soon</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Go Engine:</span>
            <span className="text-slate-200 font-semibold">~330k ops/sec</span>
          </div>

          <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className={connected ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
              {connected ? 'WS Engine Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 transition-colors">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-sans">Deterministic Core</span>
          </div>
        </div>
      </div>
    </header>
  );
};
