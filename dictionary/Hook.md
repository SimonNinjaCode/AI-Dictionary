---
description: A command the harness runs automatically at a fixed point in the agent loop — before a tool call, after an edit, at session start or end.
aliases:
  - Hooks
category: agents-and-tools
tracks:
  - coding
  - agent-systems
term_status: established
level: intermediate
---

A command the [harness](./Harness.md) runs automatically at a fixed point in the [agent loop](./Agent%20loop.md) — before a [tool call](./Tool%20call.md) executes, after one completes, when a [session](./Session.md) starts, when the [agent](./Agent.md) ends its [turn](./Turn.md). The [model](./Model.md) doesn't decide whether a hook runs; the harness runs it every time the event occurs. The idea is the same as git hooks, which run scripts at points such as pre-commit.

Hooks exist because instructions are requests. A line in [AGENTS.md](./AGENTS.md.md) saying "run the formatter after editing" depends on the model remembering it, and in a long session [attention degradation](./Attention%20degradation.md) makes it slip. The familiar result is an instruction stated clearly in AGENTS.md and half the commits still arriving unformatted. A hook that runs the formatter after every edit removes the dependency on memory.

| Event              | When it runs                                               | Typical use                                                                          |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Before a tool call | After the model emits the call, before the harness runs it | Block a dangerous command, enforce a path rule, ask for approval                     |
| After a tool call  | After execution, before the result returns to the model    | Run the formatter or an [automated check](./Automated%20check.md) on the edited file |
| Session start      | Before the first turn                                      | Load the current branch, open tickets, or other fresh context                        |
| Turn end           | When the agent yields                                      | Run the test suite; send a notification during an [AFK](./AFK.md) run                |

Event names and capabilities vary by harness.

A blocking hook works like a denied [permission request](./Permission%20request.md): its message goes back to the model as a [tool result](./Tool%20result.md), and the model chooses another approach. Output from an after-call hook can also be fed back, so the agent self-corrects from it. That makes a hook a [guardrail](./Guardrails.md) that runs outside the model.

Hooks are code running with your permissions on every matching event. A slow hook slows every tool call, and a hook defined in a cloned repository's configuration runs on your machine. Review hook configuration as you would any other script in the repository.

_Avoid:_ confusing hooks with [skills](./Skill.md). A skill is instructions the model reads when relevant; a hook is code the harness runs regardless.

_Usage:_

"I've told it three times in AGENTS.md to run prettier. It still forgets."

"Add an after-edit hook that runs prettier on the changed file. It runs whether the model remembers or not."
