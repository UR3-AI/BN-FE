export interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  note_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectListResponse {
  items: ProjectItem[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
}

export interface UseProjectsQueryParams {
  skip?: number;
  limit?: number;
}
