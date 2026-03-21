export interface RenameTagRequest {
  old_name: string;
  new_name: string;
}

export interface RenameTagResponse {
  updated_count: number;
  tag: string;
}
