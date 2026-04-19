import type { NoteDetail } from "@entities/note";

export interface NoteContentProps {
  noteNumber: number;
  noteDetail: NoteDetail | undefined;
  onSaveSuccess: () => void;
}
