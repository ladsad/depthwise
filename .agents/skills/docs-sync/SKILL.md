---
name: docs-sync
description: Rules for keeping Depthwise's documentation current as a byproduct of normal work, not a separate task. Use whenever a test starts passing against a hand-verified fixture, whenever a non-obvious technical or architectural decision gets made or changed, and at the end of any work session before wrapping up.
---

# Keeping Documentation Current

Documentation drifts when it's treated as its own task. The rule here is: doc updates ride along with the work that makes them true, in the same session, not batched later.

## When a scenario test starts passing

The moment `TestScenarioN_*` goes green against a hand-verified fixture, append the real output to `docs/scenarios/validation-results.md` under that scenario's heading — the actual trades produced and the actual final book state, not a re-statement of the expected values. This costs almost nothing since the data already exists in the test run, and it's the concrete proof that the ensemble/engine does what the spec claims. Do this before considering the task done, not as a follow-up.

## When a non-obvious decision gets made or changed

If a conversation (with the user, or reasoning through a problem solo) settles something that isn't obvious from first principles — a technology choice, a tradeoff between two real options, a scope cut, a naming/interface decision that will affect future work — propose writing or updating an ADR in `docs/decisions/` before moving on to the next task. Don't wait to be asked.

Use this format for every ADR:

```markdown
# NNNN - Short Decision Title

## Context
What problem or question forced this decision. What constraints applied.

## Decision
What was actually decided, stated plainly, one or two sentences.

## Consequences
What this makes easier, what it makes harder, what it rules out.

## Alternatives Considered
What else was on the table and why it lost.
```

Number ADRs sequentially (0001, 0002, ...), never renumber or delete old ones even if a later decision reverses one — add a new ADR that supersedes it and note the supersession in both files. The history of changing your mind is itself useful documentation.

## When architecture actually changes

`docs/architecture.md` should barely move — it's meant to be stable. Only touch it when the actual pipeline, the evidence contract, or the deterministic/LLM boundary changes, not for implementation details that don't affect the shape of the system. If you find yourself editing it frequently, that's a signal the architecture is still unsettled, not that the doc needs more detail.

## At the end of a work session

Before wrapping up, check: did anything happen today worth a line in `docs/build-log/`? This should already overlap with whatever gets posted publicly that day — same content, two destinations, not two separate writing tasks.

## What NOT to do

Don't create documentation-writing as a standalone task queued up for later ("I'll write the ADRs this weekend"). By the time later arrives, the reasoning is gone and the doc gets written thin or skipped. If a decision or result is worth documenting, it's worth documenting in the same session it happened.
