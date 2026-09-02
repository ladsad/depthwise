import React from 'react';
import { ScenarioMeta } from '../../lib/types';
import { BookOpen, CheckCircle, Target } from 'lucide-react';

interface ScenarioOverviewProps {
  scenario: ScenarioMeta | null;
}

export const ScenarioOverview: React.FC<ScenarioOverviewProps> = ({ scenario }) => {
  if (!scenario) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col space-y-3">
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
        <BookOpen className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
          Learning Lab Scenario Guide
        </h3>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {scenario.description}
      </p>

      <div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center space-x-1">
          <Target className="w-3 h-3 text-cyan-400" />
          <span>Concepts Explored:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {scenario.concepts.map((concept, idx) => (
            <span
              key={idx}
              className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-cyan-300 border border-slate-700/60"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">Ground Truth Verified</span>
        </div>
        <span className="text-slate-500">Go Test Engine Fixture</span>
      </div>
    </div>
  );
};
