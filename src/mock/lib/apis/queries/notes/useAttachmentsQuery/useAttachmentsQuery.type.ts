export interface AttachmentItem {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
}

export interface AttachmentsResponse {
  items: AttachmentItem[];
}
