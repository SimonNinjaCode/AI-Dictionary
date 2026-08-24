---
description: The repeated cycle where a model chooses an action, receives its result, and decides what to do next.
aliases:
  - Tool loop
category: agents-and-tools
tracks:
  - coding
  - agent-systems
term_status: established
level: foundational
---

The repeated cycle where a [model](./Model.md) chooses an action, receives its result, and decides what to do next. The [harness](./Harness.md) runs the cycle. The model only produces the next output for the context it receives.

| Step | Actor   | What happens                                                          |
| ---- | ------- | --------------------------------------------------------------------- |
| 1    | Harness | Builds the current context and sends a model provider request         |
| 2    | Model   | Returns text, a [tool call](./Tool%20call.md), or a completion signal |
| 3    | Harness | Checks permissions and executes the requested action                  |
| 4    | Tool    | Returns a [tool result](./Tool%20result.md)                           |
| 5    | Harness | Adds the result to context and calls the model again                  |

One user [turn](./Turn.md) may contain dozens of loop iterations. Reading a file, searching for a symbol, editing code, running a test, and fixing the failure are separate requests even though the interface presents them as one continuous piece of work.

The loop explains both capability and cost. Tools let the agent observe the environment and correct itself. Each iteration also adds context, spends tokens, introduces latency, and creates another chance to choose a poor action. A loop without a clear stop condition can repeat the same failed approach or consume a budget long after useful progress ended.

Good harnesses stop on completion, user interruption, permission denial, budget exhaustion, repeated failure, or a configured iteration limit. Durable systems also record enough state to resume safely after interruption.

_Avoid:_ calling the agent loop "the model thinking". The loop is orchestration around repeated model requests and external actions.

_Usage:_

"Why did one prompt create thirty API requests?"

"The prompt started an agent loop. Every search, file read, test run, and correction sent the updated context back to the model."
