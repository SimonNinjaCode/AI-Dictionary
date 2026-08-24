---
description: Retrieving relevant external material and adding it to model context before generating a response.
aliases:
  - Retrieval-augmented generation
category: context-retrieval-and-memory
tracks:
  - coding
  - agent-systems
term_status: established
level: intermediate
---

Retrieval-augmented generation. A system searches an external collection for material relevant to a request, places the selected material in the [context window](./Context%20window.md), and then asks the [model](./Model.md) to respond using it.

RAG separates stored knowledge from generated output. The documents stay in files, databases, search indexes, or a [vector store](./Vector%20store.md). The model does not learn them and its [parameters](./Parameters.md) do not change. Each request retrieves a temporary working set, which becomes [contextual knowledge](./Contextual%20knowledge.md) for that request.

Coding agents perform a simple form of retrieval whenever they search a repository and read the matching files. More elaborate systems split documents into chunks, create [embeddings](./Embedding.md), run similarity search, rerank the candidates, and attach citations. The added machinery is useful when the collection is too large or too unstructured for direct file search. It is wasteful when a path lookup or text search already finds the exact source.

RAG can reduce factual hallucination by supplying current source material, but it introduces its own failure chain. Retrieval may find the wrong document, omit a critical section, return stale material, or bury the answer among weak matches. The model can also ignore or misread a correct result. Evaluation therefore has to measure retrieval quality separately from answer quality.

_Avoid:_ saying the model "knows" the retrieved documents. They are temporary input, not training. Also avoid reaching for vector search when deterministic search fits the data better.

_Usage:_

"Should we fine-tune the model on our internal API docs?"

"Start with RAG. Retrieve the current endpoint and schema documentation for each task. Fine-tuning is a poor way to keep changing facts current."
