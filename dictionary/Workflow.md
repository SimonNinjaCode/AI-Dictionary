---
description: A predefined sequence of steps where code controls what runs next, even when individual steps call models.
category: reasoning-and-orchestration
tracks:
  - coding
  - agent-systems
term_status: established
level: foundational
---

A predefined sequence of steps where code controls what runs next, even when individual steps call a [model](./Model.md). The path may contain branches and retries, but those transitions are designed in advance rather than chosen freely by an [agent](./Agent.md).

The distinction is about control, not whether AI appears anywhere. A pipeline that classifies an issue, selects one of three prompts, generates a patch, runs tests, and requests review is a workflow if code owns the sequence. A coding agent given "fix this issue" chooses its searches, edits, and tests through an [agent loop](./Agent%20loop.md). Both may use the same model and tools.

Workflows are easier to predict, test, price, and audit because the allowed paths are visible. They work well when the process is understood and exceptions can be enumerated. Agents fit tasks where the necessary steps depend on observations that are difficult to encode in advance. Many useful systems combine them: a workflow controls the high-level phases while an agent handles an open-ended step inside one phase.

Calling every multi-step model application an agent hides a design decision. If the steps are stable, dynamic planning adds cost and failure modes without adding useful freedom. If the environment is varied and the path cannot be known beforehand, forcing it into a rigid workflow creates branches until the code becomes an awkward agent implementation anyway.

_Avoid:_ using "workflow" for any series of events. Name who controls the next transition. Also avoid treating workflows as less capable; constrained control is often the reason they are dependable.

_Usage:_

"Should the release-note generator be an agent?"

"The steps are fixed: read merged PRs, classify them, draft sections, validate links, publish for approval. Build a workflow and use model calls inside it."
