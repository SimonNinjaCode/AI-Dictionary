---
description: The same input can produce different output. A property of how models generate text and how providers serve requests.
category: models-and-inference
tracks:
  - coding
  - agent-systems
term_status: established
level: foundational
---

The same input can produce different output. Run a [model](./Model.md) twice with identical [context](./Context.md) and you may get two different answers — sometimes a word, sometimes a completely different approach. Nothing in your code has to change for this to happen.

It's a property of how models generate text, and how [model providers](./Model%20provider.md) serve [requests](./Model%20provider%20request.md). During [inference](./Inference.md), the model produces a probability distribution over possible next [tokens](./Token.md) and one is sampled from it — usually with some randomness on purpose, since always picking the most likely token produces repetitive, lower-quality text. One differently-sampled token early in a response changes every token after it, which is how a single different word becomes a completely different approach. Provider-side serving adds more variation on top: requests are batched together on shared hardware, and tiny floating-point differences between batches can tip a close call between two tokens. There's no setting you can flip to make it all go away.

Expect a spread of results from an [agent](./Agent.md) on the same task. Most responses fall within a reasonable bell curve of quality — that's why the non-determinism is tolerable at all — but the tails are real: some runs land well and some go badly on the same task. This has two practical consequences. Retrying is a legitimate strategy: a failed attempt is one draw from the distribution, and a fresh attempt at the same task may simply land better. And verification matters more than it would with deterministic tools — you can't test an agent's behaviour once and rely on it repeating, so [automated checks](./Automated%20check.md) have to catch the bad draws.

A short streak of bad runs is weak evidence that the model changed. People read patterns into streaks, and a few bad draws in a row can feel like proof that "the model got worse this week." Usually it's just the distribution. Real regressions do happen — a provider can ship a serving bug or change a default — and an [eval](./Eval.md) run repeatedly against a fixed configuration is how you tell the two apart.

_Usage:_

"Claude has been awful today. Did they ship a worse version?"

"Probably not — model output is non-deterministic. You're going to have good days and bad days on the same task. Retry a few times before you go looking for a cause. If it persists, run the eval suite."
