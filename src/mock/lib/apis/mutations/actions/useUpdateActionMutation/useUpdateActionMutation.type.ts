export interface ActionItemUpdateRequest {
  actionId: number;
  status?: string;
  summary?: string;
  start_time?: string | null;
  end_time?: string | null;
}

export interface ActionItemResponse {
  id: number;
  type: string;
  summary: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  confidence_score: number;
  research_status: string | null;
  research_note_number: number | null;
}
