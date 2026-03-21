export interface EntityMention {
  note_number: number;
  title: string | null;
  context: string;
  created_at: string;
}

export interface EntityMentionsResponse {
  uid: string;
  name: string;
  mentions: EntityMention[];
}
