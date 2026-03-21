export interface EntityListItem {
  uid: string;
  name: string;
  type: string;
  mention_count: number;
}

export interface EntityListResponse {
  items: EntityListItem[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
}

export interface UseEntitiesQueryParams {
  type?: string;
  search?: string;
  skip?: number;
  limit?: number;
}
