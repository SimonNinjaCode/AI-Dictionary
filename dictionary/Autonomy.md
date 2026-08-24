---
description: The degree to which an agent can choose and execute actions without human approval at each step.
category: agents-and-tools
tracks:
  - coding
  - agent-systems
term_status: established
level: foundational
---

The degree to which an [agent](./Agent.md) can choose and execute actions without human approval at each step. Autonomy is not a switch. It varies by action, environment, time, budget, and consequence.

A coding agent may read any repository file automatically, ask before editing, and be blocked from publishing. That is three autonomy levels inside one session. Another agent may edit freely inside a [sandbox](./Sandbox.md) but require approval before network access. The useful question is therefore not "is it autonomous?" but "autonomous over which decisions and within which limits?"

Higher autonomy removes waiting. It also lets an early mistake travel farther before a person sees it. A wrong assumption in a supervised turn may produce one bad suggestion. The same assumption during an [AFK](./AFK.md) run may shape a branch, migration, and test suite. Automated checks reduce some risk, but they only cover properties they assert.

Autonomy comes from several controls working together. The [permission mode](./Permission%20mode.md) decides which tool calls need approval. The environment limits blast radius. Budgets limit time, tokens, requests, or money. Checkpoints decide when a human reviews state. The system should grant autonomy where failures are cheap and reversible, then narrow it as consequences grow.

_Avoid:_ equating autonomy with intelligence. A capable model can operate under tight approval gates, while a weak loop can run unattended and cause considerable damage.

_Usage:_

"Can we make the migration agent fully autonomous?"

"Split the question. Let it inspect, plan, and test autonomously in an isolated branch. Keep schema deployment and merge behind explicit approval."
