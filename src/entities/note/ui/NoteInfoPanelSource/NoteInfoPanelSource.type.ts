import type { ActionItem, NoteDetail } from "../../model";

export interface NoteInfoPanelSourceProps {
  noteDetail: NoteDetail | undefined;
  actions: ActionItem[];
}
