export interface GraphNode {
  id: string;
  label: string;
  type: string;
  mention_count: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface GraphVisualizationResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
