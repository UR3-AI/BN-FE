import type { NoteListItem } from "@lib/types";

export interface NotePanelItemPinParams {
  noteNumber: number;
  pinned: boolean;
}

export interface NotePanelItemDeleteParams {
  noteNumber: number;
}

export interface NotePanelItemProps {
  note: NoteListItem;
  onPin: (params: NotePanelItemPinParams) => void;
  onDelete: (params: NotePanelItemDeleteParams) => void;
}
