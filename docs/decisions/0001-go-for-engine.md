# 0001 - Go for the Matching Engine

## Context

The matching engine's core problem is concurrency: many orders can arrive at effectively the same instant, and price-time priority must be resolved deterministically regardless of goroutine/thread scheduling. The language choice needed to make correct concurrent handling straightforward to write and to reason about, while also producing something efficient enough to run under free-tier hosting resource constraints, and credible to a quant/trading-infra engineering audience reviewing the project.

## Decision

Build the matching engine in Go.

## Consequences

- Go's concurrency primitives (goroutines, channels) map naturally onto the single-owner event-loop-per-symbol pattern chosen for the order book (see matching-engine-conventions skill), making the core correctness invariant easier to implement and to explain in an interview setting than it would be with manual thread/lock management.
- Produces a small, efficient binary, which matters directly for the free-hosting constraint (Cloudflare Workers, low resource ceiling).
- Prior systems/distributed-systems experience (an earlier Go project) transfers directly, reducing ramp-up time within a one-month build window.
- Rules out using the same language across the entire stack (frontend is TypeScript/React regardless), but this was never a goal.

## Alternatives Considered

- **Rust** - stronger raw performance and "quant infra" credibility signal, but steeper implementation cost within a tight solo timeline; concurrency correctness is enforced at compile time but at the cost of significantly more time spent per feature. Rejected for this project's timeline, not rejected as a worse language in general.
- **TypeScript/Node for the engine too** - would unify the stack on one language, but weaker fit for a hard concurrency problem and a much less credible signal to a quant-engineering audience specifically evaluating systems rigor.
