import type { NoteDetail, NoteStreamPhase } from "@entities/note";

export interface NoteInfoPanelProps {
  noteNumber: number;
  noteDetail: NoteDetail | undefined;
  streamPhase: NoteStreamPhase;
}
