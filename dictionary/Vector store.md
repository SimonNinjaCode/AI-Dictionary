---
description: A data store that indexes embeddings and retrieves nearby vectors by similarity.
aliases:
  - Vector database
category: context-retrieval-and-memory
tracks:
  - agent-systems
term_status: established
level: intermediate
---

A data store that indexes [embeddings](./Embedding.md) and retrieves the nearest vectors to a query vector. It usually stores metadata and a pointer to the original text, code, image, or record alongside each vector.

A vector store answers a different question from ordinary text search. Text search asks which documents contain these characters or terms. Vector search asks which stored representations are mathematically similar to this query. The second can bridge vocabulary differences, but it is less exact. Many systems combine both methods and rerank the combined results.

The store is one component in a [RAG](./RAG.md) pipeline, not the pipeline itself. Something still has to choose source material, split it into chunks, create vectors, update them when sources change, filter by permissions, retrieve candidates, and add the selected text to context. A stale index returns stale evidence even when the underlying document was corrected yesterday.

Access control needs particular care. Similarity search can discover the existence or content of documents a user should not see unless permission filters apply before results reach the model. Filtering after generation is too late because the restricted content has already entered the context window and may affect the answer.

Use a vector store when semantic similarity solves a real retrieval problem across a sizable collection. A repository with stable paths and good symbol search may need no vector layer at all. Extra retrieval machinery adds indexing jobs, storage, latency, and another place for relevance to fail.

_Avoid:_ treating "vector database" as a synonym for memory. It stores representations; a memory system decides what to record, retrieve, trust, and forget.

_Usage:_

"Do we need a vector database for the project's twenty architecture notes?"

"Probably not. Start with filenames, headings, and text search. Add vector search when users repeatedly fail because they phrase the same idea differently."
