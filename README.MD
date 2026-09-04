# Depthwise

Depthwise is a market microstructure learning platform with two connected modes:

- **Learning Lab** — synthetic, scenario-driven order book simulations with known ground truth, built to teach specific microstructure concepts (order matching, imbalance, price discovery, liquidity shocks).
- **Live Pulse** — the same engine and signal layer, fed by real (free-tier) trade/quote data, surfacing evidence about real price moves.

## Architecture & Principles

**The LLM is never the source of truth.** Market data flows through the deterministic matching engine and signal layer to produce structured evidence first. The LLM's only job is to explain the already-computed evidence in plain language. It does not receive raw market data and "reason" its way to a verdict.

Depthwise never claims a price move "is real" or "is fake" in Live Pulse. It surfaces evidence and lets the user weigh it (e.g. "Evidence suggests this move is supported by unusually strong order-flow characteristics").

## Features

- **Living Level-2 Order Book Ladder**: Real-time bid/ask depth ladder with FIFO time-priority queue slots (`#1`, `#2`) and inside spread metrics.
- **Interactive Step Debugger**: Single-tick forward stepping, sequence scrubbing, variable playback speed (0.5x to Fast), and reset controls.
- **Quantitative Signal HUD (OFI)**: Real-time Cont-Kukanov-Stoikov Order Flow Imbalance directional pressure gauge with equilibrium center lines and threshold flag indicators (>=3.0x buy skew).
- **Depth-over-Time Waterfall Heatmap**: Bookmap-style 2D surface rendering liquidity density saturation, trade execution markers, and blue mid-price trajectory curves.
- **Microstructure Event Inspector**: Plain-English explanations of price-time priority, spread crossing, partial fills, and cancellation handling.
- **Scenario Library**:
  - `01 / Basic Matching & Price-Time Priority` (FIFO queueing, partial fills, cancels)
  - `02 / Order-Flow Imbalance (OFI)` (4–5x sustained buy pressure, upward price drift)

## Tech Stack

| Layer | Choice |
|---|---|
| Matching engine | Go (Deterministic single-symbol event loop, sub-microsecond latency) |
| Signal engine | Go (Cont-Kukanov-Stoikov OFI, rolling window ratio accumulator) |
| Frontend | React + TypeScript (TailwindCSS, Light Technical Brutalism) |
| Real-time transport | WebSockets (shared by both modes) |
| Real data provider | Alpaca (free real-time IEX trade/quote data), Finnhub as backup |
| Agent / LLM | Cloudflare Workers AI (open model), Claude Haiku as a paid fallback only if needed |
| Backend hosting | Cloudflare Workers + Durable Objects |
| Frontend hosting | Vercel or Cloudflare Pages |

## Quickstart

### 1. Start the Matching Engine Server
```powershell
cd engine
go run ./cmd/server
```
*Server runs on `http://localhost:8080` with WebSocket endpoint at `ws://localhost:8080/ws/lab`.*

### 2. Start the Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### 3. Run Tests
```powershell
cd engine
go test -v ./...
```
