export interface UpdateTimezoneRequest {
  timezone: string;
}

export interface UserResponse {
  id: string;
  email: string;
  timezone: string;
}
