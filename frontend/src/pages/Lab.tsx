import { useState } from 'react';
import { useLabEngine } from '../lib/ws-client';
import { Navbar } from '../components/Navbar';
import { OrderBook } from '../components/OrderBook';
import { PlaybackControls } from '../components/PlaybackControls';
import { Timeline } from '../components/Timeline';
import { SignalHUD } from '../components/SignalHUD';
import { Heatmap } from '../components/Heatmap';
import { DepthChart } from '../components/DepthChart';
import { EventInspector } from '../components/EventInspector';
import { TradeTape } from '../components/TradeTape';
import { ScenarioOverview } from '../components/ScenarioOverview';

export default function Lab() {
  const [activeMode, setActiveMode] = useState<'lab' | 'live'>('lab');
  const engine = useLabEngine();

  const currentEventID = engine.scenario?.events && engine.currentSeq > 0
    ? engine.scenario.events[engine.currentSeq - 1].id
    : undefined;

  return (
    <div className="min-h-screen bg-canvas text-content flex flex-col font-sans bg-tech-grid pb-12">
      {/* Top Navbar */}
      <Navbar
        connected={engine.connected}
        activeMode={activeMode}
        onSelectMode={setActiveMode}
      />

      {/* Main Lab View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Playback Controls & Sequence Scrubber */}
        <PlaybackControls
          scenario={engine.scenario}
          allScenarios={engine.allScenarios}
          currentSeq={engine.currentSeq}
          totalEvents={engine.totalEvents}
          isPlaying={engine.isPlaying}
          onStep={engine.step}
          onReset={engine.reset}
          onPlay={engine.play}
          onPause={engine.pause}
          onJumpTo={engine.jumpTo}
          onSelectScenario={engine.loadScenario}
        />

        {/* Interactive Sequence Timeline */}
        <Timeline
          scenario={engine.scenario}
          currentSeq={engine.currentSeq}
          onJumpTo={engine.jumpTo}
        />

        {/* Real-Time Quantitative Signal HUD (OFI) */}
        <SignalHUD
          ofi={engine.ofi}
          scenarioId={engine.scenario?.id}
        />

        {/* Depth-over-Time Waterfall Heatmap (Bookmap Surface) */}
        <Heatmap
          bookHistory={engine.bookHistory}
          currentSeq={engine.currentSeq}
        />

        {/* Dashboard 2D Structural Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Level-2 Order Book & Depth Chart & Execution Tape */}
          <div className="lg:col-span-7 space-y-4 flex flex-col">
            <OrderBook book={engine.book} latestEventID={currentEventID} />
            <DepthChart book={engine.book} />
            <TradeTape trades={engine.allTrades} />
          </div>

          {/* Right Column: Event Inspector & Scenario Concepts */}
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            <EventInspector
              explanation={engine.currentExplanation}
              scenario={engine.scenario}
              currentSeq={engine.currentSeq}
            />
            <ScenarioOverview scenario={engine.scenario} />
          </div>
        </div>
      </main>
    </div>
  );
}
