---
description: A software development kit that exposes APIs and types for building agents with a provider or platform.
category: agents-and-tools
tracks:
  - agent-systems
term_status: established
level: intermediate
---

A software development kit that exposes APIs, types, and helpers for building [agents](./Agent.md) with a provider or platform. It commonly covers model requests, streaming, tool definitions, sessions, tracing, and the [agent loop](./Agent%20loop.md).

An SDK is a distribution and support boundary, not a specific architecture. A model provider may publish one that maps closely to its API. A platform may publish another that connects several providers behind shared interfaces. Both can be called Agent SDKs even when one is a thin client and the other contains substantial orchestration.

The distinction from an [agent framework](./Agent%20framework.md) is one of emphasis. An SDK gives code access to capabilities. A framework supplies an application structure and makes more control-flow decisions. The boundary is fuzzy, so inspect what the package actually owns: request formatting, tool execution, state persistence, retries, routing, or deployment.

Provider SDKs often expose new model features first and preserve provider-specific semantics. Cross-provider SDKs can make switching easier but may reduce every provider to their common features or attach escape hatches for differences. Neither choice is automatically more portable. Application code coupled to a framework's session and tool abstractions can be harder to move than direct calls isolated behind a small local interface.

Treat the SDK as part of the harness and test upgrades accordingly. A version change can alter message conversion, default retries, event ordering, or which usage fields are reported even when the model name stays fixed.

_Avoid:_ using "SDK" and "model" interchangeably. Updating the client library does not update the model, though it may change how requests reach it.

_Usage:_

"The model behaves differently after the dependency upgrade, but the model version did not change."

"Check the Agent SDK. It may have changed the tool loop, request shape, or defaults around retries and streaming."
