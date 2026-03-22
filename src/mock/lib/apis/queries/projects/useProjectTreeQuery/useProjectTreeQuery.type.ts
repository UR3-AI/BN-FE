export interface ProjectTreeNode {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  note_count: number;
  children: ProjectTreeNode[];
}

export interface ProjectTreeResponse {
  items: ProjectTreeNode[];
}
