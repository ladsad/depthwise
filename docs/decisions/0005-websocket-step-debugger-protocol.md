# 0005 - Interactive WebSocket Step-Debugger Protocol

## Context

Learning Lab simulations require interactive inspectability so learners and technical reviewers can examine order book dynamics at individual tick granularity (`Seq N -> Seq N+1`), scrub through execution history, or run autoplay at variable speeds without losing synchronization with the matching engine state.

## Decision

Implement a stateful WebSocket session handler (`/ws/lab`) in Go backed by the deterministic `ProcessStep` engine method. Clients dispatch JSON commands (`load_scenario`, `step`, `jump_to`, `play`, `pause`, `reset`) and receive structured state payloads containing the updated `BookSnapshot`, executed `Trades`, and a microsecond-precise `StepExplanation`. Sequence scrubbing (`jump_to`) replays the deterministic event log from sequence 0 up to the target sequence index.

## Consequences

- Delivers zero-latency, bi-directional stepping and real-time playback synchronization between Go engine and React UI.
- Enables deep explainability: every event transition provides structured reasons for resting queue positions and spread crossings.
- Replaying deterministic sequences from scratch on jump-to guarantees snapshot accuracy without complex caching.

## Alternatives Considered

- **Pure REST polling / HTTP POST per step**: Rejected due to high latency overhead and poor auto-play frame rates.
- **Client-side matching engine in TypeScript**: Rejected to preserve the single Go source of truth shared between synthetic simulations and real-time Live Pulse ingestion.
