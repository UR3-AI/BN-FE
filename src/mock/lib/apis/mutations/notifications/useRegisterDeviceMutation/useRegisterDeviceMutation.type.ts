export interface RegisterDeviceRequest {
  fcm_token: string;
  device_type: "web" | "android" | "ios";
}

export interface RegisterDeviceResponse {
  id: string;
  fcm_token: string;
  device_type: string;
  created_at: string;
}
