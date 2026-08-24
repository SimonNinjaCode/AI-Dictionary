---
description: Model output constrained to a defined schema so downstream code can parse it without interpreting free text.
aliases:
  - Schema-constrained output
category: models-and-inference
tracks:
  - coding
  - agent-systems
term_status: established
level: intermediate
---

[Model](./Model.md) output constrained to a defined schema instead of unconstrained prose. The schema names the fields, types, required values, and allowed shapes that downstream code expects. JSON is common, but the important part is the contract, not the serialization format.

Structured output solves a boundary problem. A human can read "the build failed because `UserId` is missing" and infer the cause. A program needs something like `{ "status": "failed", "missingType": "UserId" }`. Asking for JSON in a [system prompt](./System%20prompt.md) helps, but it does not guarantee valid JSON or the right fields. Schema enforcement gives the [harness](./Harness.md) a shape it can validate before anything acts on the result.

There are two distinct failure cases. Syntax can be invalid, such as a missing quote. Semantics can be invalid even when parsing succeeds, such as a severity outside the allowed enum or a file path placed in the message field. A schema catches the first class and some of the second. Application checks still have to decide whether the values make sense.

[Tool calls](./Tool%20call.md) are a specialized use of structured output. The model selects a tool and fills its argument schema. The harness validates the call, applies permissions, and executes it. Other uses include extracting issues from a diff, returning a test plan, classifying a ticket, or producing data for another agent.

_Avoid:_ treating schema conformance as truth. A perfectly valid object can still contain a hallucinated filename or the wrong conclusion.

_Usage:_

"The reviewer returns a paragraph and our CI script keeps guessing whether it passed."

"Use structured output with a verdict enum and a findings array. Validate the shape, then decide what each verdict is allowed to do."
