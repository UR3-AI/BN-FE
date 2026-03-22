export interface ProjectChildItem {
  id: string;
  name: string;
  color: string | null;
  note_count: number;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export interface RecentNoteItem {
  note_number: number;
  title: string;
  created_at: string;
}

export interface ProjectDetailResponse {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  note_count: number;
  parent_id: string | null;
  children: ProjectChildItem[];
  breadcrumb: BreadcrumbItem[];
  recent_notes: RecentNoteItem[];
  created_at: string;
  updated_at: string;
}
