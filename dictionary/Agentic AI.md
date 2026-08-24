---
description: A loose label for AI systems that pursue goals through multiple actions rather than answering once.
aliases:
  - Agentic system
category: agents-and-tools
tracks:
  - coding
  - agent-systems
term_status: emerging
level: foundational
---

A loose label for systems that pursue a goal through multiple actions rather than producing one answer. An agentic system usually combines a [model](./Model.md), a [harness](./Harness.md), tools, working state, and an [agent loop](./Agent%20loop.md) that continues until the task ends or a limit stops it.

The term describes a degree, not a clean product category. A chat assistant that only returns prose is weakly agentic or not agentic at all. A coding agent that searches files, edits code, runs tests, reads failures, and tries again has more of the relevant behavior. A system that also chooses subgoals, delegates work, and operates without immediate approval has more [autonomy](./Autonomy.md), but autonomy and agentic behavior are not identical.

Vendors use "agentic AI" broadly because it sounds more capable than "workflow with model calls". The label can hide the parts that determine actual behavior. Ask which tools exist, who chooses the next step, where state lives, what permissions apply, and what ends the run. Those answers are concrete enough to design and review.

The distinction matters when estimating risk. Adding a tool does not merely improve an answer. It creates a path from generated text to an external effect. Repeating the loop lets one bad assumption influence several later actions. Permissions, [guardrails](./Guardrails.md), evaluation, and human checkpoints become part of the system rather than optional polish.

_Avoid:_ using "agentic" as a synonym for advanced, intelligent, or autonomous. Name the behavior that matters.

_Usage:_

"The proposal says we need an agentic AI platform. What does that mean here?"

"Translate it into mechanisms. Which goals can it pursue, which tools can it call, how does it choose the next action, and when must a person approve?"
