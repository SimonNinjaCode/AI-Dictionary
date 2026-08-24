---
description: A library or platform that supplies reusable components for building and running agents.
category: agents-and-tools
tracks:
  - agent-systems
term_status: established
level: intermediate
---

A library or platform that supplies reusable components for building and running [agents](./Agent.md). Common components include the [agent loop](./Agent%20loop.md), tool registration, message handling, state, tracing, retries, approval gates, and model-provider adapters.

The framework sits above raw model APIs. A model API accepts a request and returns output. The framework decides how many requests to make, when to execute tools, how to store results, and what happens after a failure. In that sense it provides a configurable [harness](./Harness.md), though some frameworks also include deployment and observability services.

Frameworks reduce setup work when an application needs orchestration patterns they already implement. They can also hide behavior that becomes important during debugging. A default retry may duplicate an external action. Automatic message conversion may drop provider-specific fields. A memory abstraction may load stale data into every session. Teams should understand the loop and state model beneath the convenient API.

Choose a framework based on the control flow and operational guarantees the system needs, not the length of its feature list. A simple tool-using assistant may need only a model SDK and a small explicit loop. A long-running workflow with checkpoints, human approval, and recovery after crashes benefits more from a stateful framework.

An [Agent SDK](./Agent%20SDK.md) and an agent framework overlap. SDK usually means a provider-supported programming interface. Framework implies more opinions about orchestration and application structure. Some products are both.

_Avoid:_ assuming a framework makes an application agentic or reliable. It provides mechanisms; the application still defines goals, permissions, checks, and stopping behavior.

_Usage:_

"We added a framework before deciding what the agent does."

"Write the control flow first. If the framework removes code you already know you need, keep it. If it invents the architecture, it is premature."
