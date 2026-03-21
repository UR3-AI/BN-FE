export interface UploadAttachmentRequest {
  noteNumber: number;
  file: File;
}

export interface UploadAttachmentResponse {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
}
