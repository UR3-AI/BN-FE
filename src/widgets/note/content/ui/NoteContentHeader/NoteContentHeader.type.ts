import type { ProcessingStatus } from "@entities/note";
import type { SaveStatus } from "@features/note/update";

export interface NoteContentHeaderProps {
  noteNumber: number;
  saveStatus: SaveStatus;
  processingStatus: ProcessingStatus;
  tags: string[];
}
