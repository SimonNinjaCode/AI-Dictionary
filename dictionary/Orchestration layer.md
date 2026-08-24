---
description: The component that coordinates agent steps, state, routing, limits, and handoffs across a task.
category: reasoning-and-orchestration
tracks:
  - agent-systems
term_status: established
level: intermediate
---

The component that coordinates steps, state, routing, limits, and handoffs across an agent task. It decides which actor runs next and what information that actor receives. The actor may be a model, tool, person, [workflow](./Workflow.md), or another agent.

In a simple system, the [harness](./Harness.md) and orchestration layer are the same program. The harness runs one model's tool loop; orchestration becomes a distinct concern when the system has several roles, long-lived state, conditional paths, or work that continues across processes. The boundary is architectural, not a product requirement.

An orchestration layer may route a request to a specialist, start parallel tasks, wait for their results, enforce budgets, request human approval, retry a failed step, or persist a checkpoint. It should make these transitions visible. Hiding them inside prompts produces control flow that is difficult to inspect and reproduce.

The layer can use code, a model, or both to choose the next step. Code is appropriate for rules that must always hold, such as permission checks and spending limits. A model can help classify an unfamiliar task or choose among tools when the decision depends on natural-language context. Letting the model decide does not remove the need for coded boundaries around what it may select.

In a [multi-agent system](./Multi-agent%20system.md), orchestration also defines ownership. Without one place that knows which task is pending, running, complete, or blocked, agents can duplicate work or wait on results nobody is producing.

_Avoid:_ calling every wrapper around a model an orchestration layer. The term earns its keep when there are meaningful transitions, actors, or state to coordinate.

_Usage:_

"The researcher and reviewer keep calling each other indefinitely."

"Put the transition in the orchestration layer. Limit review rounds, record the current owner, and define which verdict ends the loop."
