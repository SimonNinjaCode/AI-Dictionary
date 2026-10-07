---
description: Tokens the model generates back. Billed at a higher rate than input tokens, since they cost more compute to produce.
category: models-and-inference
tracks:
  - coding
  - agent-systems
term_status: established
level: foundational
---

[Tokens](./Token.md) the [model](./Model.md) generates back. Providers usually bill them at a higher rate than [input tokens](./Input%20tokens.md), since generation requires a sequential prediction for every token. The exact ratio varies by model and provider.

Everything the model writes counts: the prose you read, the code it emits, [tool calls](./Tool%20call.md), and any extended thinking the model does before answering. That last one surprises people — reasoning tokens are billed as output even when the [harness](./Harness.md) doesn't show them to you, and turning up [effort](./Effort.md) spends more of them. A short visible answer can carry a large output bill; the usage report shows it, the displayed text doesn't.

Output tokens also set the pace of a [session](./Session.md). The model reads input quickly but generates output one token at a time, so when a [turn](./Turn.md) feels slow, the output being written is usually most of the wait. A very large uncached input still adds a delay before the first token, and a long pause before any text appears is often reasoning being generated.

_Usage:_

"The refactor session is burning through credit even though the inputs are small."

"Agent's rewriting whole files instead of patching. Output tokens are the expensive side here — get it emitting edits and the bill drops."
