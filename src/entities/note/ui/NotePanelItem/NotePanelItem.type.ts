import type { NoteListItem } from "../../model";

export interface NotePanelItemPinParams {
  noteNumber: number;
  pinned: boolean;
}

export interface NotePanelItemDeleteParams {
  noteNumber: number;
}

export interface NotePanelItemProps {
  note: NoteListItem;
  isActive: boolean;

  onSelect: (noteNumber: number) => void;
  onPin: (params: NotePanelItemPinParams) => void;
  onDelete: (params: NotePanelItemDeleteParams) => void;
}
