# 0003 - Ensemble of Interpretable Metrics Instead of a Single Confidence Score

## Context

Depthwise's core value proposition is helping a user judge whether a price move is meaningful. The original framing considered a single significance test producing something like a "statistically real" verdict or a black-box confidence score, similar to most existing consumer-facing trading tools.

That framing carries two problems. First, claiming a price move "is real" or "is fake" asserts a level of statistical certainty about causality that's genuinely hard to defend against a real, uncontrolled market - there is no way to fully rule out confounding causes for any given move, so a flat verdict overstates what the underlying methods can actually support. Second, a single opaque confidence number is exactly the "AI wrapper" / black-box pattern the project is explicitly trying to differentiate from, and it teaches the user nothing about the underlying mechanism.

## Decision

Replace any single verdict-style output with an ensemble of four independent, individually-interpretable metrics - volatility-adjusted move size, order-flow imbalance, spread behavior, and trade-size footprint - each surfaced to the user with its own flagged/not-flagged status. The overall output is how many of the four independently agree, not a single aggregated score. All product and UI language is required to frame results as evidence ("evidence suggests this move is supported by unusually strong order-flow characteristics"), never as a claim that a move "is real."

## Consequences

- More defensible under scrutiny from a skeptical quant reviewer, an interviewer, or the user themselves, because every claim traces back to a specific, individually-checkable piece of evidence rather than an opaque aggregate.
- Directly supports the project's visual-literacy goal - the UI can show which specific metrics fired and why, rather than a single number the user has to trust on faith.
- Because each metric is independently interpretable, the ensemble can be validated piece by piece against the Learning Lab's known ground truth (see 0004), rather than only being checkable as an opaque whole.
- Costs more implementation and design effort than a single score would - four metrics to define, threshold, and visually surface instead of one.
- Requires ongoing discipline in UI copy, prompts, and documentation to maintain the evidence-not-verdict framing consistently; this is enforced going forward via the architecture-principles skill rather than left to be remembered ad hoc.

## Alternatives Considered

- **Single black-box confidence score** - simpler to build and display, but exactly the pattern experienced engineers have learned to distrust, and unauditable in a way that undercuts the project's core credibility goal with both target audiences (quant engineers, FDE-style reviewers).
- **A single, more rigorous statistical test (e.g. one formal event-study model) instead of an ensemble** - would still be a black box relative to the user even if internally rigorous, since a single p-value or test statistic doesn't let a non-expert see which underlying mechanism is actually driving the result.
