export interface TypeDistribution {
  type: string;
  count: number;
}

export interface HubEntity {
  uid: string;
  name: string;
  type: string;
  mention_count: number;
}

export interface GraphStatsResponse {
  total_entities: number;
  total_relationships: number;
  total_notes_with_entities: number;
  type_distribution: TypeDistribution[];
  hub_entities: HubEntity[];
}
