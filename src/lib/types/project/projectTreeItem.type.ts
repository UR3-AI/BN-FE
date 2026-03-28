export interface ProjectTreeItem {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  note_count: number;
  children: ProjectTreeItem[];
}
