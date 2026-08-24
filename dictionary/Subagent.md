---
description: An agent spawned by another agent via a tool call. It runs in a separate session and reports a result to its parent.
aliases:
  - Sub-agent
category: agents-and-tools
tracks:
  - coding
  - agent-systems
term_status: established
level: intermediate
---

An [agent](./Agent.md) spawned by another agent via a [tool call](./Tool%20call.md). Runs in its own [session](./Session.md) with its own [context window](./Context%20window.md), and reports a [tool result](./Tool%20result.md) back. Distinct from a [handoff](./Handoff.md): the parent specifically expects a return; a handoff has no return path. Some harnesses allow nested subagents and others cap the tree at one level. That limit belongs to the harness, not the definition.

The point is to keep noisy work out of the parent's context. A broad search or a long file-reading expedition produces pages of tool results, most of which matter only long enough to find the answer. Run inside the parent and all of it stays in the parent's context for the rest of the session. Run inside a subagent and the noise fills a disposable window instead — only the final report lands in the parent's context. The report is a [secondary source](./Secondary%20source.md): the parent gets the subagent's account of what it found, not the raw results, so anything the report leaves out is invisible to the parent.

Subagents can also run concurrently, so a parent can fan several out over independent pieces of work. A hierarchy of coordinating agents is a [multi-agent system](./Multi-agent%20system.md), which adds routing and state concerns beyond one parent collecting results.

_Usage:_

"The grep results are blowing out my context."

"Spawn a subagent to do the search — it'll burn its own context window on the noise and report back the two file paths you actually need."
