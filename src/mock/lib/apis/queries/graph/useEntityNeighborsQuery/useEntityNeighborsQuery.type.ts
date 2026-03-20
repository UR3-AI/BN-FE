import type { GraphNode, GraphEdge } from "../useGraphVisualizationQuery/useGraphVisualizationQuery.type";

export interface EntityNeighborsResponse {
  center_uid: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
