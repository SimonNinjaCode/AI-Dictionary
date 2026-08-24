---
description: A repeatable measurement of model or agent behavior across representative tasks and scoring criteria.
aliases:
  - Evals
  - Evaluation
category: evaluation-and-observability
tracks:
  - coding
  - agent-systems
term_status: established
level: foundational
---

A repeatable measurement of [model](./Model.md) or [agent](./Agent.md) behavior across representative tasks and scoring criteria. An eval answers a bounded question such as whether a coding agent fixes a class of bugs, follows repository constraints, selects the right tool, or avoids exposing secrets.

An eval differs from an [automated check](./Automated%20check.md). A test or type checker verifies a deterministic property of one artifact. An eval runs a system across a dataset of cases and aggregates performance. Individual cases may use deterministic assertions, human ratings, or [automated review](./Automated%20review.md) by another model.

A useful eval has tasks that resemble real use, a documented scoring method, and enough repeated runs to expose [non-determinism](./Non-determinism.md). It also records the model, harness version, tools, prompts, and settings. A score without that configuration cannot explain whether a change came from the model or the surrounding system.

The dataset should include failures the team actually cares about. Happy-path prompts produce reassuring numbers and little information. Coding-agent evals may include ambiguous issues, stale documentation, failing tests with misleading errors, permission boundaries, and tasks where the correct action is to ask a question or make no change. [Observability](./Observability.md) supplies the traces needed to explain why a score changed rather than merely recording that it changed.

Evals compare versions and catch regressions. They do not prove that a system is safe or generally intelligent. A system can overfit a public benchmark or perform well on the measured distribution while failing on new repositories and users.

_Avoid:_ using one impressive transcript as an eval. It is an example, not a repeatable measurement.

_Usage:_

"The new system prompt feels better. Should we ship it?"

"Run the agent eval suite against both versions. Compare task success, regressions, tool use, cost, and variance across repeated runs."
