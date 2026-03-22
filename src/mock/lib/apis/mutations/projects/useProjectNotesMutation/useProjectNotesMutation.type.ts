export interface ProjectNotesRequest {
  projectId: string;
  noteNumber: number;
  action: "add" | "remove";
}

export interface ProjectNotesResponse {
  project_id: number;
  note_number: number;
  action: string;
  message: string;
}
