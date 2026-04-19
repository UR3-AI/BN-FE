export interface SummaryReadyPayload {
  title: string;
  summary: string;
  tags: string[];
}

export interface ActionsReadyPayload {
  action_item_count: number;
}

export interface EntitiesReadyPayload {
  entity_count: number;
  relationship_count: number;
}

export interface SavingPayload extends SummaryReadyPayload {
  action_item_count: number;
}

export interface CompletedPayload extends SavingPayload {
  entity_count: number;
}
