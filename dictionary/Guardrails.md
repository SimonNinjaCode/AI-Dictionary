---
description: Controls that constrain what an agent may receive, decide, produce, or do before effects reach the environment.
aliases:
  - Guardrail
category: safety-permissions-and-identity
tracks:
  - coding
  - agent-systems
term_status: established
level: foundational
---

Controls that constrain what an [agent](./Agent.md) may receive, decide, produce, or do before effects reach the [environment](./Environment.md). Guardrails can exist at input, model, tool, output, and approval boundaries.

Prompt instructions are the weakest form because the same model interprets both the rule and the content that may conflict with it. Stronger controls run outside the model. A tool schema can reject invalid arguments. A [sandbox](./Sandbox.md) can prevent access to the host filesystem. A permission check can require approval before publishing. An output validator can block data that does not match a contract.

| Boundary    | Example control                                    |
| ----------- | -------------------------------------------------- |
| Input       | Remove secrets and label untrusted content         |
| Model       | State instruction priority and allowed behavior    |
| Tool        | Allowlist operations and validate arguments        |
| Environment | Isolate files, network, credentials, and processes |
| Output      | Validate schemas, policy, and sensitive data       |
| Human       | Require approval before high-consequence actions   |

No single guardrail establishes safety. Controls fail in different ways, so important actions need layers. A prompt may resist a [prompt injection](./Prompt%20injection.md), but a network allowlist should still prevent an unexpected destination. A path validator may block traversal, while human review checks whether editing any file is appropriate.

Guardrails also create friction and false positives. If harmless operations require constant approval, users learn to approve without reading. Controls should match the actual consequence and provide clear failure information so the agent can choose a permitted alternative.

_Avoid:_ using "guardrails" as a claim without naming the enforced control. "The agent has guardrails" says nothing about what can happen.

_Usage:_

"The prompt tells the agent never to delete production data."

"Keep the instruction, but remove production credentials and block destructive database tools. The enforceable guardrail belongs outside the prompt."
