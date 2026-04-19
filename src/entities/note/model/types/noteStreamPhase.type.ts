export type NoteStreamPhase =
  | "idle"
  | "pending"
  | "processing"
  | "analyzing"
  | "summary_ready"
  | "actions_ready"
  | "entities_ready"
  | "saving"
  | "completed"
  | "failed";
