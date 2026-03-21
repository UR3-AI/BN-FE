export interface MergeEntitiesRequest {
  source_uid: string;
  target_uid: string;
}

export interface MergeEntitiesResponse {
  merged_uid: string;
  name: string;
  type: string;
}
