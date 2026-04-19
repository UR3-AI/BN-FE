import type { ActionItem } from "../../model";

export interface UseNoteActionsParams {
  noteNumber: number;
}

export type UseNoteActionsResponse = ActionItem[];
