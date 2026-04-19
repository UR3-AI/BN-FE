import type { NoteStreamPhase } from "@entities/note";

export interface UseNoteStreamParams {
  noteNumber: number;
  enabled?: boolean;
}

export interface UseNoteStreamReturn {
  phase: NoteStreamPhase;
  subscribe: () => void;
  unsubscribe: () => void;
}
