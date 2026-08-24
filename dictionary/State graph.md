---
description: A control-flow model where nodes perform steps and directed edges define permitted transitions between states.
category: reasoning-and-orchestration
tracks:
  - agent-systems
term_status: established
level: advanced
---

A control-flow model where nodes perform steps and directed edges define permitted transitions between states. A node might call a model, execute a tool, wait for approval, or transform data. An edge decides which node may run next based on the current state.

Unlike a simple linear [workflow](./Workflow.md), a state graph can branch, loop, pause, and resume. An implementation agent might move from `plan` to `edit`, then to `test`. A failing test returns it to `edit`; a passing test moves it to `review`; a risky change moves it to `await-approval`. These transitions are explicit enough to inspect and test.

The graph does not have to be visual, and using a graph library does not make the system reliable. The important part is that control state has a defined schema and transitions have conditions. If the state is an untyped conversation transcript and prompts vaguely ask what to do next, the diagram may describe intent while the runtime behaves differently.

State graphs fit tasks with several legitimate paths and repeated steps. They are more structure than a short fixed pipeline needs. They are less flexible than giving an agent unrestricted control, which is often the point: the agent can reason inside a node while code restricts the paths between nodes.

Persisted state can support [durable execution](./Durable%20execution.md). After a crash, the runtime reloads the last committed state and continues from a known node rather than reconstructing progress from prose.

_Avoid:_ confusing model context with workflow state. Context is input to a model request. State is the authoritative record the orchestration code uses to control execution.

_Usage:_

"The agent sometimes publishes before review and sometimes reviews twice."

"Make the states explicit. Only allow publish after an approved review state, and encode the retry transition instead of describing it in the prompt."
