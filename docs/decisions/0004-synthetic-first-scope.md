# 0004 - Synthetic-First Scope: Learning Lab Before Live Pulse

## Context

The project's stated goal of high visual comprehension and literacy required deciding how real vs. synthetic market data would be used. Real order-book depth data (full L2/L3) is not available for free from any provider - only real trades and top-of-book quotes are free, which cannot support the rich, full-depth order-book visualization the project's teaching goal depends on. Real market data is also inherently messy and ambiguous day to day, which is a poor teaching artifact for someone encountering these mechanics for the first time. Additionally, the project's evidence ensemble (0003) can only be validated with confidence against data where the ground truth is actually known.

## Decision

Build two modes sharing one engine and one signal layer: a Learning Lab using fully synthetic, scenario-driven order flow with known, designed ground truth, built and hardened first; and a Live Pulse mode using real, free trade/quote data, added second once the engine and signal layer are already proven against the Lab's ground truth. The Lab is not a stretch goal or secondary feature - it is the primary technical and pedagogical core of the project.

## Consequences

- Enables full, clean, controllable order-book-depth visualization in the Lab, which no free real-data source could support.
- Provides genuine ground truth to validate the matching engine and the ensemble's four metrics against (see 0003 and the scenario-specs skill), rather than only being checkable against ambiguous real-world outcomes.
- Removes external-service risk from the hardest and most original part of the build - the Lab has no dependency on any third-party API staying up or behaving predictably, which matters directly for a solo, time-boxed, daily-cadence build.
- Live Pulse's visualization is necessarily less rich than the Lab's (no depth chart, since that data isn't free) - this is treated as an accurate reflection of a real data constraint, not a shortcoming to hide from the user.
- Defers the "prove this works on the real world right now" credibility moment until after the Lab is solid, which is an intentional sequencing choice, not a limitation of the final product.

## Alternatives Considered

- **Real data only, from the start** - would provide immediate "this is really happening" credibility, but without full depth data (unaffordable for a free project) and without known ground truth, neither the rich visualization goal nor the ensemble's validation could be properly achieved.
- **Building both modes in parallel from day one** - rejected in favor of sequential build order; building Live Pulse before the engine is proven against known ground truth would mean debugging data-feed issues and matching-logic issues simultaneously, with no reliable way to attribute a bug to one or the other.
