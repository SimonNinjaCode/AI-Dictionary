---
description: The identity an agent authenticates as when it reaches other systems — whose permissions its actions carry and whose name the logs show.
aliases:
  - Non-human identity
category: safety-permissions-and-identity
tracks:
  - coding
  - agent-systems
term_status: emerging
level: intermediate
---

The identity an [agent](./Agent.md) authenticates as when its [tool calls](./Tool%20call.md) reach other systems — a repository host, a ticket system, a database, an email API. It decides whose permissions every action carries and whose name the audit log records. An agent has no identity of its own unless someone gives it one; by default it uses whatever credentials are present in its [environment](./Environment.md).

On a developer machine, that default means your identity. A coding agent runs in your shell, so it inherits your git credentials, your cloud CLI session, and any tokens in your environment variables. The consequence shows up later: a force-push, a closed ticket, or a changed cloud setting appears in the log under your name, and the log can't tell whether you did it or the agent did.

There are three common arrangements:

| Arrangement               | Whose permissions apply                                            | What the log shows                         |
| ------------------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| Borrowed user credentials | Everything the user can do                                         | The user                                   |
| Delegated (on-behalf-of)  | The overlap of what the user can do and what the agent was granted | The user, with the agent as the acting app |
| Own identity              | Only what the agent's identity was granted                         | The agent                                  |

An own identity can be a service account, an application registration with its own permissions, or an agent-specific identity type; some identity platforms now offer one, such as Microsoft Entra Agent ID.

A separate identity is what makes [least privilege](./Least%20privilege.md) workable for agents. You can grant the scopes the task needs, revoke them without touching anyone's account, and read the logs to see what the agent did. It also bounds [prompt injection](./Prompt%20injection.md): an injected instruction can do only what the identity allows. A [sandbox](./Sandbox.md) limits what the agent can reach on the machine; identity limits what it can do once a request leaves the machine.

_Avoid:_ treating "the agent runs as me" as a neutral default. It grants the agent every permission you hold.

_Usage:_

"Who closed forty tickets in the backlog last night?"

"The log says you. The [AFK](./AFK.md) agent was running with your API token. Give it its own identity with write access to one project, and the log will show which of you did what."
