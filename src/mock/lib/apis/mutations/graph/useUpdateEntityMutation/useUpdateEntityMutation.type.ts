export interface UpdateEntityRequest {
  uid: string;
  name?: string;
  type?: string;
}

export interface UpdateEntityResponse {
  uid: string;
  name: string;
  type: string;
}
