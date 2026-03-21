export type ExecuteActionRequest = number;

export interface ExecuteActionResponse {
  action_id: number;
  research_status: string;
  message: string;
}
