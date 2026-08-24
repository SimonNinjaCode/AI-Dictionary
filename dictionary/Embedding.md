---
description: A numerical representation used to compare the semantic similarity of text, code, images, or other data.
category: context-retrieval-and-memory
tracks:
  - agent-systems
term_status: established
level: intermediate
---

A numerical representation of text, code, images, or other data, produced so that items with similar meaning tend to be near each other in a mathematical space. An embedding model converts an item into a fixed-length list of numbers called a vector.

The useful operation is comparison. A search system embeds the user's query, compares that vector with stored vectors, and returns nearby items. This can find a function that "verifies login credentials" even when the query says "authentication check" and the source contains neither exact phrase. A [vector store](./Vector%20store.md) indexes the vectors so this comparison remains practical across a large collection.

Embeddings discard information. They compress an item into a representation optimized for certain similarity patterns, not an exact copy. Two passages can be close because they discuss the same topic while disagreeing on the answer. Code with similar names can be close despite different behavior. Similarity is therefore a candidate-selection signal, not proof that a result is correct.

Chunking changes what gets embedded. Embedding a whole repository produces a representation too broad to retrieve a specific contract. Embedding tiny fragments loses the surrounding names and intent. Most retrieval systems choose a chunk size, overlap adjacent chunks, and preserve metadata such as file path, symbol, date, and source authority. Those choices often matter more than switching between two competent embedding models.

_Avoid:_ calling an embedding a summary or a database record. Humans cannot read it, and the original material must remain available for inspection.

_Usage:_

"Semantic search returned three files about authentication, but none contains the permission rule."

"The embeddings found topical similarity. Rerank the candidates and fetch the source text before treating any result as evidence."
