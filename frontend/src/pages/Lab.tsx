import { useState } from 'react';
import { useLabEngine } from '../lib/ws-client';
import { Navbar } from '../components/Navbar';
import { OrderBook } from '../components/OrderBook';
import { PlaybackControls } from '../components/PlaybackControls';
import { Timeline } from '../components/Timeline';
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
    <div className="min-h-screen bg-canvas text-content flex flex-col font-sans bg-tech-grid">
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
          currentSeq={engine.currentSeq}
          totalEvents={engine.totalEvents}
          isPlaying={engine.isPlaying}
          onStep={engine.step}
          onReset={engine.reset}
          onPlay={engine.play}
          onPause={engine.pause}
          onJumpTo={engine.jumpTo}
        />

        {/* Interactive Sequence Timeline */}
        <Timeline
          scenario={engine.scenario}
          currentSeq={engine.currentSeq}
          onJumpTo={engine.jumpTo}
        />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Order Book & Execution Tape */}
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
