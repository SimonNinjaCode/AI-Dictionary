import type { Term, GraphData, GraphNode, GraphEdge } from "./types";

export function buildGraphData(terms: Term[]): GraphData {
  const termIds = new Set(terms.map((t) => t.id));

  const nodes: GraphNode[] = terms.map((t) => ({
    id: t.id,
    name: t.name,
    size: Math.max(t.relationships.length, 1),
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  }));

  const seen = new Set<string>();
  const edges: GraphEdge[] = [];

  for (const term of terms) {
    for (const rel of term.relationships) {
      if (!termIds.has(rel)) continue;
      const key = [term.id, rel].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ source: term.id, target: rel });
    }
  }

  return { nodes, edges };
}

export function getTermById(terms: Term[], id: string): Term | null {
  return terms.find((t) => t.id === id) ?? null;
}
