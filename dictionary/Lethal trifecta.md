---
description: An agent with private data access, exposure to untrusted content, and a way to send data out can be made to leak that data.
category: safety-permissions-and-identity
tracks:
  - coding
  - agent-systems
term_status: emerging
level: intermediate
---

The combination of three capabilities in one [agent](./Agent.md): access to private data, exposure to untrusted content, and a way to communicate externally. With all three present, a [prompt injection](./Prompt%20injection.md) in the untrusted content can instruct the agent to read the private data and send it out. Simon Willison named the pattern in [June 2025](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/).

| Leg                    | Examples for a coding agent                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Private data           | Source code, environment variables, credentials, customer records in a database it can query                      |
| Untrusted content      | Web pages, dependency READMEs, issue comments, email, [tool results](./Tool%20result.md) from third-party servers |
| External communication | Network requests, pushing to a public branch, opening an issue, rendering an image URL that encodes data          |

The framing is useful because prompt injection can't be reliably filtered. [Guardrails](./Guardrails.md) that catch most attacks still let some through. The trifecta replaces "can we detect the attack?" with "can the attack succeed if it isn't detected?". Remove any one leg and the theft path closes: without private data there is nothing to take, without untrusted content there is no attacker instruction, and without an outbound channel nothing leaves.

The legs rarely arrive together by design. They accumulate one [tool](./Tool.md) at a time: a database tool for one task, a web-fetch tool for another, an [MCP](./MCP.md) server that can post messages for a third. Each addition looks harmless on its own, and nobody reviews the combination. Review the full set of tools available in a [session](./Session.md), not each tool separately.

For coding agents, the outbound leg is usually the easiest to cut: a [sandbox](./Sandbox.md) with no network, or an allowlist of hosts. Some outbound channels don't look like network access. A commit pushed to a public repository is external communication.

_Avoid:_ treating "the data is internal" as a mitigation. Internal data is the leg the attacker wants.

_Usage:_

"The support agent reads incoming email, looks up customer records, and can send replies. Is that acceptable?"

"That's the lethal trifecta in one agent. An email can instruct it to reply with another customer's records. Split it: draft the reply without database access, and put the record lookup behind a human approval."
