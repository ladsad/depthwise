import React from 'react';
import { OFIMetric } from '../../lib/types';
import { Activity, ShieldAlert, ArrowUpRight, ArrowDownRight, Scale, Info } from 'lucide-react';

interface SignalHUDProps {
  ofi: OFIMetric | null;
  scenarioId?: string;
}

export const SignalHUD: React.FC<SignalHUDProps> = ({ ofi, scenarioId }) => {
  const ratio = ofi?.ratio ?? 1.0;
  const isFlagged = ofi?.flagged ?? false;
  const deltaOFI = ofi?.delta_ofi ?? 0;
  const cumOFI = ofi?.cumulative_ofi ?? 0;
  const buyFlow = ofi?.buy_flow_window ?? 0;
  const sellFlow = ofi?.sell_flow_window ?? 0;

  // Compute position on a logarithmic or clamped scale for the visual pressure meter (0% to 100%, 50% = 1.0 ratio)
  // Ratio <= 0.2 -> 10%, Ratio 1.0 -> 50%, Ratio >= 5.0 -> 90%
  let meterPosPct = 50;
  if (ratio > 1.0) {
    meterPosPct = 50 + Math.min(45, (Math.min(ratio, 5.0) - 1.0) / 4.0 * 45);
  } else if (ratio < 1.0 && ratio > 0) {
    meterPosPct = 50 - Math.min(45, (1.0 - Math.max(ratio, 0.2)) / 0.8 * 45);
  }

  const isBuySkew = ratio > 1.2;
  const isSellSkew = ratio < 0.8;

  return (
    <div className="bg-canvas-surface border border-border flex flex-col shadow-none">
      {/* Structural Header */}
      <div className="px-4 py-2.5 border-b border-border bg-canvas-subtle flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-terracotta" />
          <h2 className="text-xs font-bold text-content uppercase tracking-wider font-mono">
            02 / QUANTITATIVE SIGNAL HUD &bull; CONT-KUKANOV-STOIKOV OFI
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {isFlagged ? (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-burgundy-subtle text-burgundy border border-burgundy-border flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-burgundy" />
              <span>OFI FLAGGED (RATIO &ge; 3.0&times;)</span>
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-canvas-subtle text-content-secondary border border-border flex items-center space-x-1">
              <Scale className="w-3 h-3 text-content-muted" />
              <span>FLOW BALANCED</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Directional Flow Pressure Meter */}
        <div className="space-y-1.5 bg-canvas-subtle p-3 border border-border">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center space-x-1 text-burgundy font-bold">
              <ArrowDownRight className="w-3.5 h-3.5 text-burgundy" />
              <span>SELL PRESSURE (WINDOW: {sellFlow})</span>
            </span>
            <span className="text-content-secondary font-semibold">
              EQUILIBRIUM (1.0&times;)
            </span>
            <span className="flex items-center space-x-1 text-terracotta-dark font-bold">
              <span>BUY PRESSURE (WINDOW: {buyFlow})</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-terracotta" />
            </span>
          </div>

          {/* Meter Track */}
          <div className="relative h-4 bg-canvas-dark border border-border overflow-hidden">
            {/* Center Neutral Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border-strong z-10" />

            {/* Threshold Marker Lines */}
            <div className="absolute left-[20%] top-0 bottom-0 w-px bg-burgundy-border dashed z-10" title="Sell Flag Threshold (0.33x)" />
            <div className="absolute left-[80%] top-0 bottom-0 w-px bg-terracotta-border dashed z-10" title="Buy Flag Threshold (3.0x)" />

            {/* Dynamic Pressure Bar */}
            {isBuySkew && (
              <div
                className="absolute left-1/2 top-0 bottom-0 bg-terracotta transition-all duration-300"
                style={{ width: `${meterPosPct - 50}%` }}
              />
            )}
            {isSellSkew && (
              <div
                className="absolute top-0 bottom-0 bg-burgundy transition-all duration-300"
                style={{ left: `${meterPosPct}%`, width: `${50 - meterPosPct}%` }}
              />
            )}

            {/* Current Position Pointer */}
            <div
              className="absolute top-0 bottom-0 w-1.5 bg-content transition-all duration-300 -ml-0.75 z-20"
              style={{ left: `${meterPosPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-content-muted">
            <span>&le; 0.33&times; (SELL SKEW)</span>
            <span>RATIO = {ratio.toFixed(2)}&times;</span>
            <span>&ge; 3.00&times; (BUY SKEW)</span>
          </div>
        </div>

        {/* 4-Column Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Card 1: Imbalance Ratio */}
          <div className="bg-canvas-subtle p-2.5 border border-border">
            <div className="text-[10px] font-mono text-content-muted uppercase">Imbalance Ratio</div>
            <div className={`text-base font-mono font-bold mt-0.5 ${isFlagged ? 'text-burgundy' : 'text-content'}`}>
              {ratio.toFixed(2)}&times;
            </div>
            <div className="text-[9px] font-mono text-content-secondary mt-0.5">
              {isFlagged ? 'Flagged Threshold Exceeded' : 'Within Normal Range'}
            </div>
          </div>

          {/* Card 2: Tick Delta OFI */}
          <div className="bg-canvas-subtle p-2.5 border border-border">
            <div className="text-[10px] font-mono text-content-muted uppercase">Tick Delta OFI</div>
            <div className={`text-base font-mono font-bold mt-0.5 ${deltaOFI > 0 ? 'text-terracotta-dark' : deltaOFI < 0 ? 'text-burgundy' : 'text-content'}`}>
              {deltaOFI > 0 ? `+${deltaOFI}` : deltaOFI}
            </div>
            <div className="text-[9px] font-mono text-content-secondary mt-0.5">
              Net BBO flow this tick
            </div>
          </div>

          {/* Card 3: Cumulative OFI */}
          <div className="bg-canvas-subtle p-2.5 border border-border">
            <div className="text-[10px] font-mono text-content-muted uppercase">Cumulative OFI</div>
            <div className={`text-base font-mono font-bold mt-0.5 ${cumOFI > 0 ? 'text-terracotta-dark' : cumOFI < 0 ? 'text-burgundy' : 'text-content'}`}>
              {cumOFI > 0 ? `+${cumOFI}` : cumOFI} <span className="text-xs font-normal text-content-muted">units</span>
            </div>
            <div className="text-[9px] font-mono text-content-secondary mt-0.5">
              Total session flow delta
            </div>
          </div>

          {/* Card 4: Window Flow Sum */}
          <div className="bg-canvas-subtle p-2.5 border border-border">
            <div className="text-[10px] font-mono text-content-muted uppercase">Window Flow (W=20)</div>
            <div className="text-base font-mono font-bold mt-0.5 text-content">
              <span className="text-terracotta-dark">+{buyFlow}</span> / <span className="text-burgundy">-{sellFlow}</span>
            </div>
            <div className="text-[9px] font-mono text-content-secondary mt-0.5">
              Buy units vs. Sell units
            </div>
          </div>
        </div>

        {/* Microstructure Principle Explanatory Box */}
        <div className="p-3 bg-terracotta-subtle border border-terracotta-border text-xs font-mono text-content">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-terracotta-dark shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-terracotta-dark uppercase tracking-wider">
                Microstructure Mechanism in Focus:
              </span>
              <p className="text-content-secondary leading-relaxed font-sans text-[11px]">
                {scenarioId === 'scenario_2'
                  ? 'In Scenario 2, sustained buy-side flow (4–5x buy vs. sell volume) repeatedly exhausts resting asks at $101 and $102 while buyers queue new bids at higher levels. This mechanically causes upward price drift through aggregate flow, satisfying Kyle’s Lambda relationship (ΔP ≈ λ · OFI) without any single block trade dominating.'
                  : 'Cont-Kukanov-Stoikov OFI captures changes in top-of-book depth across consecutive ticks. It registers positive when buyers establish higher bids or lift asks, and negative when sellers establish lower asks or consume bids.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignalHUD;
