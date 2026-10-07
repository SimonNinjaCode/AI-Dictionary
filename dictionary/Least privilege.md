---
description: Granting an agent only the access its current task needs, so a wrong or hijacked action has a bounded effect.
category: safety-permissions-and-identity
tracks:
  - coding
  - agent-systems
term_status: established
level: foundational
---

Granting an [agent](./Agent.md) only the access its current task needs — the [tools](./Tool.md), files, network destinations, and credential scopes — and nothing it might need later. The principle is old; Saltzer and Schroeder listed it among their protection design principles in 1975. Agents make it more pressing because the party choosing actions can be wrong or redirected.

Any action the agent's access allows can happen: through a misread instruction, a [hallucinated](./Hallucination.md) path, or a [prompt injection](./Prompt%20injection.md) in content it reads. You can't fully control which actions the agent chooses. You can control which ones are possible. Least privilege changes the safety question from "will the agent behave?" to "what is the worst it can do?", which is easier to answer.

Over-privilege usually accumulates rather than being granted at once. A broad token is added to unblock one task, stays in the [environment](./Environment.md), and is available to every later run, including runs on unrelated tasks.

| Layer       | Narrow grant                                                                  | Broad grant                                              |
| ----------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| Tools       | Only the tools the task uses; read-only variants where they exist             | Every tool the harness and [MCP](./MCP.md) servers offer |
| Filesystem  | The project directory                                                         | The home directory                                       |
| Network     | An allowlist of hosts                                                         | Unrestricted outbound access                             |
| Credentials | A short-lived token scoped to one repository or project                       | A personal token with full account access                |
| Approval    | A [permission request](./Permission%20request.md) before irreversible actions | Bypass everywhere                                        |

Narrow grants create friction: the agent hits a limit and asks, or fails. That friction is useful when the action is consequential and wasted when it isn't. Widen grants for reversible work inside a [sandbox](./Sandbox.md); keep them narrow where effects leave it. Credentials are easiest to scope when the agent has its own [agent identity](./Agent%20identity.md) instead of borrowing yours.

_Avoid:_ "the agent needs admin to be useful". It usually needs one or two specific permissions that nobody has listed yet.

_Usage:_

"The agent only needs to read the staging database. Why does its connection string use the admin user?"

"Because that was the one in `.env`. Create a read-only role for it. A bad query then fails instead of dropping a table."
