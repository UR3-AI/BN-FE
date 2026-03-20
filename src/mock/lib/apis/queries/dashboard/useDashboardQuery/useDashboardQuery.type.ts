export interface DashboardRecentNote {
  note_number: number;
  title: string | null;
  created_at: string;
}

export interface DashboardGraphStats {
  total_entities: number;
  total_relationships: number;
}

export interface DashboardActionSummary {
  total: number;
  pending: number;
  completed: number;
}

export interface DashboardResponse {
  recent_notes: DashboardRecentNote[];
  graph_stats: DashboardGraphStats;
  action_summary: DashboardActionSummary;
}
