import type { ActionStatus } from "./actionStatus.type";
import type { ActionType } from "./actionType.type";
import type { ResearchStatus } from "./researchStatus.type";

export interface ActionItem {
  id: number;
  type: ActionType;
  summary: string;
  start_time: string | null;
  end_time: string | null;
  is_all_day: boolean;
  status: ActionStatus;
  confidence_score: number;
  research_status: ResearchStatus | null;
  research_note_number: number | null;
}
