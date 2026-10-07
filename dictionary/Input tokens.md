---
description: Tokens the harness sends on each model provider request. Billed at a lower rate than output tokens.
category: models-and-inference
tracks:
  - coding
  - agent-systems
term_status: established
level: foundational
---

[Tokens](./Token.md) the [harness](./Harness.md) sends on each [model provider request](./Model%20provider%20request.md) — the [system prompt](./System%20prompt.md), the conversation history, [tool results](./Tool%20result.md), everything the [model](./Model.md) reads before it writes. Billed at a lower rate than [output tokens](./Output%20tokens.md), because the provider processes input in parallel rather than one token at a time.

When doing [AI](./AI.md) coding, input tokens make up most of your bill. The model is [stateless](./Stateless.md), so each [turn](./Turn.md) re-sends the entire [session](./Session.md) as input: your first message, every response, every tool result since. The input for turn fifty contains the previous forty-nine turns, plus the tool definitions and [AGENTS.md](./AGENTS.md.md) content loaded at session start, whether or not the task uses them. A single model provider request might produce a few hundred output tokens but re-send a hundred thousand input tokens of accumulated history.

The [prefix cache](./Prefix%20cache.md) reduces the cost: history that exactly matches a previous request is billed as cheap [cache tokens](./Cache%20tokens.md) rather than full-price input. When input costs still hurt, the fix is to shrink what gets re-sent — [clearing](./Clearing.md) or [compacting](./Compaction.md) between tasks, and the [context engineering](./Context%20engineering.md) that decides what gets loaded at all.

_Usage:_

"Bill's high but the [agent](./Agent.md)'s barely writing anything."

"It's the input tokens — every turn re-sends the whole session. Without the prefix cache you re-pay for the history each request."
