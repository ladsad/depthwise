export interface OrderEvent {
  seq: number;
  type: 'new' | 'cancel';
  id: string;
  side?: 'buy' | 'sell';
  price?: number;
  qty?: number;
}

export interface Trade {
  buyer_id: string;
  seller_id: string;
  price: number;
  qty: number;
}

export interface RestingOrder {
  id: string;
  qty: number;
}

export interface BookSnapshot {
  bids: Record<number, RestingOrder[]>;
  asks: Record<number, RestingOrder[]>;
}

export interface StepExplanation {
  seq: number;
  event_type: string;
  event_id: string;
  action: 'rested' | 'matched_full' | 'matched_partial' | 'cancelled' | 'cancel_rejected';
  summary: string;
  details: string[];
  trades: Trade[];
  book: BookSnapshot;
}

export interface ScenarioMeta {
  id: string;
  title: string;
  description: string;
  concepts: string[];
  total_events: number;
  events: OrderEvent[];
}

export interface WSServerMessage {
  type: 'scenario_loaded' | 'step_result' | 'playback_state' | 'error';
  scenario?: ScenarioMeta;
  current_seq: number;
  total_events: number;
  is_playing: boolean;
  book: BookSnapshot;
  trades?: Trade[];
  all_trades?: Trade[];
  explanation?: StepExplanation;
  all_explanations?: StepExplanation[];
  error_message?: string;
}

export interface WSClientMessage {
  type: 'load_scenario' | 'step' | 'reset' | 'jump_to' | 'play' | 'pause';
  scenario_id?: string;
  seq?: number;
  interval_ms?: number;
}
