export interface ProjectDetailResponse {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  note_count: number;
  created_at: string;
  updated_at: string;
}
