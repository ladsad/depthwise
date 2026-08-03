---
name: project-context
description: Overview of the Depthwise project — what it is, its two modes, tech stack, and hosting. Use at the start of any session, or whenever a task needs broader context about the product than just the immediate file being edited.
---

# Depthwise — Project Context

Depthwise is a market microstructure learning platform with two connected modes:

- **Learning Lab** — synthetic, scenario-driven order book simulations with known ground truth, built to teach specific microstructure concepts (order matching, imbalance, price discovery, liquidity shocks).
- **Live Pulse** — the same engine and signal layer, fed by real (free-tier) trade/quote data, surfacing evidence about real price moves.

**Build order:** Learning Lab first (harder, more original, no external dependency), Live Pulse second (bolts onto the proven engine). Being built as a daily, public build-in-public series — favor work that produces a demoable checkpoint every day or two over large, uninterruptible changes.

## Tech stack (locked)

| Layer | Choice |
|---|---|
| Matching engine | Go |
| Frontend | React + TypeScript |
| Real-time transport | WebSockets (shared by both modes) |
| Real data provider | Alpaca (free real-time IEX trade/quote data), Finnhub as backup |
| Agent / LLM | Cloudflare Workers AI (open model), Claude Haiku as a paid fallback only if needed |
| Backend hosting | Cloudflare Workers + Durable Objects |
| Frontend hosting | Vercel or Cloudflare Pages |

Do not suggest alternate stacks (e.g. a different language for the engine, a different hosting provider) unless explicitly asked to reconsider — these were deliberately chosen against a "genuinely free, no cold-start-on-idle" hosting constraint.

## Non-negotiable framing

Depthwise never claims a price move "is real" or "is fake." It surfaces evidence and lets the user weigh it. See the `architecture-principles` skill for why, and for the exact language to use in any UI copy, agent explanations, or documentation this project touches.

## Audiences this project is built for

1. Quant / trading-infra engineers evaluating the matching engine's correctness and rigor.
2. Forward-Deployed-Engineer-style reviewers evaluating whether a technical system is made legible to a non-expert.

When making a judgment call with no clear right answer, prefer whichever option better serves both audiences at once, rather than optimizing for one.
