---
name: matching-engine-conventions
description: Go coding conventions and correctness rules for the Depthwise matching engine — order book, price-time priority, concurrency handling. Use whenever writing, modifying, or reviewing code in the engine/ directory, or anything touching order matching, order book state, or concurrent order submission.
---

# Matching Engine Conventions

## Price-time priority — the correctness rule that can't be compromised

At every price level, orders must be filled strictly in arrival order. This must hold even under concurrent submission — two orders arriving "simultaneously" from the system's perspective must still be resolved deterministically based on the order they were actually received/sequenced by the engine, never based on goroutine scheduling luck.

Practical implications:
- Order book state (the bid/ask ladders) must be mutated through a single, serialized entry point per symbol — do not allow concurrent goroutines to mutate the same symbol's book directly. Prefer a pattern where each symbol's book is owned by one goroutine that processes an ordered channel of incoming order events (matching engine as an event loop), rather than fine-grained locking sprinkled through book logic. This is easier to reason about and easier to prove correct.
- Every incoming order (new, cancel, modify) must be assigned a monotonic sequence number at ingestion, before it reaches any matching logic — this sequence number is the ground truth for time priority, not wall-clock time.
- Partial fills must preserve the *original* time priority of the remaining quantity — a partially filled order does not go to the back of the queue.

## What "correct" means here, concretely

- Given a fixed, ordered sequence of order events replayed twice, the resulting book state and trade sequence must be byte-identical both times. If it isn't, there's a concurrency bug — this is the core invariant to test against, not just "it seems to work when I click around."
- Cancels racing against fills: if a cancel and a matching fill for the same order are both in flight, the sequence number determines which one "wins" — implement and test this explicitly, don't leave it to chance.

## Benchmarking expectations

Every matching engine change that touches the hot path (order ingestion → matching → book update) should be benchmarkable in isolation. Track and report:
- Throughput (orders/sec) under concurrent submission
- Latency percentiles (p50/p95/p99) from order ingestion to match/book-update completion

These numbers are part of the project's credibility with a quant-engineering audience — don't treat benchmarking as optional polish, treat it as part of "done" for any engine-layer change.

## Style

- Prefer explicit, readable concurrency primitives (channels, single-owner goroutines) over clever lock-free tricks unless a specific bottleneck justifies the complexity — readability matters here because this code needs to be explainable in an interview, not just fast.
- Every exported type/function in the engine package needs a doc comment explaining *why*, not just *what* — this codebase is a portfolio artifact people will actually read.
