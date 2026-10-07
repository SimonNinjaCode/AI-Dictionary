---
description: The process that sets a model's parameters by exposing it to vast amounts of text and adjusting to improve next-token prediction.
aliases:
  - Fine-tuning
category: models-and-inference
tracks:
  - coding
  - agent-systems
term_status: established
level: intermediate
---

The process that sets a [model](./Model.md)'s [parameters](./Parameters.md), by exposing it to vast amounts of text and adjusting parameters to improve [next-token prediction](./Next-token%20prediction.md). A one-time, expensive process done by the [model provider](./Model%20provider.md). Encompasses both pre-training (the bulk run) and post-training (later refinements like instruction-following and safety); the distinction doesn't matter at this glossary's level.

The mechanism is repetition at scale: show the model a stretch of text, have it predict the next [token](./Token.md), nudge the parameters toward whatever the actual next token was, and repeat across trillions of tokens. Nothing is stored as facts or rules — everything the model "knows" is a side effect of getting better at prediction, compressed into the parameters as [parametric knowledge](./Parametric%20knowledge.md).

Two consequences matter day to day. Training ends at a point in time, so the model has a [knowledge cutoff](./Knowledge%20cutoff.md) — it hasn't seen the library version you upgraded to last month. And training is rarely the lever you have. Some providers offer fine-tuning — further training on your own examples — but it is slow, it produces a separate model to maintain, and it goes stale as soon as the code changes. When the model doesn't know your codebase, your conventions, or your internal APIs, the practical fix is putting that material into [context](./Context.md), the input you control on every request.

_Usage:_

"Can we get it to know our internal API?"

"Not via training — that's a months-long process by the model provider. Load the API docs into context instead, that's the lever you actually have."
