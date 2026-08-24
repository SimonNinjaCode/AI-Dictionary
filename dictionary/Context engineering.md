---
description: Deliberately selecting, ordering, and maintaining the information available to a model for a task.
category: context-retrieval-and-memory
tracks:
  - coding
  - agent-systems
term_status: established
level: foundational
---

Deliberately selecting, ordering, and maintaining the [context](./Context.md) available to a [model](./Model.md) for a task. It includes what enters the context window, when it arrives, how it is represented, and when it is removed.

Prompt writing changes one instruction. Context engineering manages the information system around that instruction. For a coding task, that may mean loading the interface before its call sites, giving the agent the failing test rather than the entire test suite, and pointing to repository instructions instead of pasting them into every turn. For an agent system, it may also include retrieval, memory, tool descriptions, conversation history, and summaries.

More context is not automatically better. Irrelevant files consume [tokens](./Token.md), increase cost, and compete with the facts that matter. Missing context causes the opposite failure: the agent guesses at an API, violates a decision it never saw, or repeats work already completed. The job is to keep the smallest useful set available and make omitted material discoverable through [context pointers](./Context%20pointer.md) or tools.

Timing matters as much as selection. A database schema loaded before the task is understood may scroll into old history before it becomes useful. The same schema retrieved when the agent reaches the persistence step is easier to use. [Progressive disclosure](./Progressive%20disclosure.md), retrieval, clearing, and compaction are context-engineering techniques because they control that timing.

_Avoid:_ using "prompt engineering" for the entire process. A prompt is one part of the context, not the storage, retrieval, ordering, and cleanup around it.

_Usage:_

"The agent has the whole repository in context and still keeps missing the interface contract."

"That is a context-engineering failure. Give it the contract, the failing call site, and a way to fetch supporting files. Drop the rest until it becomes relevant."
