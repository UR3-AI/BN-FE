import type { NoteDetail } from "@entities/note";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface NoteEditorForm {
  title: string;
  content: string;
}

export interface UseNoteEditorParams {
  noteNumber: number;
  noteDetail: NoteDetail | undefined;
  onSaveSuccess?: () => void;
}
