import React from 'react';
import { ScenarioMeta } from '../../lib/types';
import { BookOpen, CheckCircle, Target } from 'lucide-react';

interface ScenarioOverviewProps {
  scenario: ScenarioMeta | null;
}

export const ScenarioOverview: React.FC<ScenarioOverviewProps> = ({ scenario }) => {
  if (!scenario) return null;

  return (
    <div className="bg-canvas-surface border border-border p-4 flex flex-col space-y-3">
      <div className="flex items-center space-x-2 border-b border-border pb-2">
        <BookOpen className="w-3.5 h-3.5 text-mustard" />
        <h3 className="text-xs font-bold text-content uppercase tracking-wider font-mono">
          04 / SCENARIO SPECIFICATION
        </h3>
      </div>

      <p className="text-xs text-content-secondary font-sans leading-relaxed">
        {scenario.description}
      </p>

      <div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-content-secondary font-bold mb-1.5 flex items-center space-x-1">
          <Target className="w-3 h-3 text-mustard" />
          <span>MICROSTRUCTURE CONCEPTS:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {scenario.concepts.map((concept, idx) => (
            <span
              key={idx}
              className="text-[11px] font-mono px-2 py-0.5 bg-mustard-subtle text-mustard-dark border border-mustard-border font-medium"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center space-x-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-mustard" />
          <span className="text-mustard-dark font-bold">Ground Truth Verified</span>
        </div>
        <span className="text-content-muted">Go Test Engine Fixture</span>
      </div>
    </div>
  );
};

