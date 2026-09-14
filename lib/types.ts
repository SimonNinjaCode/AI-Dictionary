export interface Term {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  tracks: string[];
  level: string;
  status: string;
  aliases: string[];
  body: string;
  relationships: string[];
}

export interface GraphNode {
  id: string;
  name: string;
  size: number; // derived from relationship count
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
