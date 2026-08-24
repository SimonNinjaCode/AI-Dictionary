---
description: A system where multiple agents have separate contexts or roles and exchange work toward a larger outcome.
aliases:
  - Multi-agent architecture
category: reasoning-and-orchestration
tracks:
  - coding
  - agent-systems
term_status: established
level: intermediate
---

A system where multiple [agents](./Agent.md) have separate contexts, roles, or responsibilities and exchange work toward a larger outcome. The agents may run sequentially, concurrently, or in repeated rounds. They may use the same model with different instructions or entirely different models and tools.

Multiple agents are useful when work separates cleanly. One can inspect a backend contract while another checks the frontend usage. A reviewer can receive a fresh context instead of inheriting the assumptions that produced the code. A coordinator can combine results after the independent work finishes. These are information-flow benefits, not evidence that a crowd of models is inherently smarter than one.

The system pays an orchestration cost. Tasks must be divided, each agent must receive enough context, outputs must use compatible formats, and conflicts must be resolved. Parallel work can also duplicate searches or produce incompatible edits. The apparent throughput of five active agents means little if one person spends longer reviewing and merging their results than a single agent would have spent doing the task.

A [subagent](./Subagent.md) is one common implementation, but the terms are not identical. A subagent has a parent and a return path. A multi-agent system may instead use peers, a shared queue, a [workflow](./Workflow.md), or an [orchestration layer](./Orchestration%20layer.md) that assigns work dynamically.

Start with one agent until a specific boundary justifies another context. Add agents to isolate noisy research, parallelize independent tasks, introduce a separate reviewer, or enforce different permissions.

_Avoid:_ splitting one tightly coupled task across agents merely to increase activity. Coordination can consume the gain.

_Usage:_

"Let's launch ten agents across the same refactor."

"First identify ten independent outputs. If they all touch the same types and tests, you have created a merge queue, not parallelism."
