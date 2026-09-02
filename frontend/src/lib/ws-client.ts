import { useState, useEffect, useRef, useCallback } from 'react';
import { WSServerMessage, WSClientMessage, BookSnapshot, Trade, StepExplanation, ScenarioMeta } from './types';

export interface UseLabEngineReturn {
  connected: boolean;
  scenario: ScenarioMeta | null;
  currentSeq: number;
  totalEvents: number;
  isPlaying: boolean;
  book: BookSnapshot;
  allTrades: Trade[];
  latestTrades: Trade[];
  currentExplanation: StepExplanation | null;
  allExplanations: StepExplanation[];
  error: string | null;
  loadScenario: (id: string) => void;
  step: () => void;
  reset: () => void;
  jumpTo: (seq: number) => void;
  play: (intervalMs?: number) => void;
  pause: () => void;
}

export function useLabEngine(wsUrl: string = 'ws://localhost:8080/ws/lab'): UseLabEngineReturn {
  const [connected, setConnected] = useState(false);
  const [scenario, setScenario] = useState<ScenarioMeta | null>(null);
  const [currentSeq, setCurrentSeq] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [book, setBook] = useState<BookSnapshot>({ bids: {}, asks: {} });
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [latestTrades, setLatestTrades] = useState<Trade[]>([]);
  const [currentExplanation, setCurrentExplanation] = useState<StepExplanation | null>(null);
  const [allExplanations, setAllExplanations] = useState<StepExplanation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  const sendMessage = useCallback((msg: WSClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          setError(null);
        };

        ws.onclose = () => {
          setConnected(false);
          reconnectTimer = setTimeout(connect, 2000);
        };

        ws.onerror = (e) => {
          console.error('WebSocket connection error:', e);
          setConnected(false);
        };

        ws.onmessage = (event) => {
          try {
            const data: WSServerMessage = JSON.parse(event.data);
            if (data.scenario) setScenario(data.scenario);
            setCurrentSeq(data.current_seq);
            setTotalEvents(data.total_events);
            setIsPlaying(data.is_playing);
            if (data.book) setBook(data.book);
            if (data.all_trades) setAllTrades(data.all_trades);
            if (data.trades) setLatestTrades(data.trades);
            if (data.explanation) setCurrentExplanation(data.explanation);
            if (data.all_explanations) setAllExplanations(data.all_explanations);
            if (data.error_message) setError(data.error_message);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };
      } catch (err) {
        console.error('WebSocket initialization error:', err);
        reconnectTimer = setTimeout(connect, 2000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.close();
      }
    };
  }, [wsUrl]);

  const loadScenario = useCallback((id: string) => {
    sendMessage({ type: 'load_scenario', scenario_id: id });
  }, [sendMessage]);

  const step = useCallback(() => {
    sendMessage({ type: 'step' });
  }, [sendMessage]);

  const reset = useCallback(() => {
    sendMessage({ type: 'reset' });
  }, [sendMessage]);

  const jumpTo = useCallback((seq: number) => {
    sendMessage({ type: 'jump_to', seq });
  }, [sendMessage]);

  const play = useCallback((intervalMs: number = 600) => {
    sendMessage({ type: 'play', interval_ms: intervalMs });
  }, [sendMessage]);

  const pause = useCallback(() => {
    sendMessage({ type: 'pause' });
  }, [sendMessage]);

  return {
    connected,
    scenario,
    currentSeq,
    totalEvents,
    isPlaying,
    book,
    allTrades,
    latestTrades,
    currentExplanation,
    allExplanations,
    error,
    loadScenario,
    step,
    reset,
    jumpTo,
    play,
    pause,
  };
}
