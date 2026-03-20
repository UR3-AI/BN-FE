export interface TagItem {
  tag: string;
  count: number;
}

export interface TagListResponse {
  items: TagItem[];
  total: number;
}
