import type { NoteStreamPhase, ProcessingStatus } from "@entities/note";

export interface NoteInfoPanelProcessingProps {
  noteNumber: number;
  processingStatus: ProcessingStatus;
  streamPhase: NoteStreamPhase;
  summary: string | undefined;
}
