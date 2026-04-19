import type { UR3Token } from "../../model";

export interface UseLoginRequest {
  email: string;
  password: string;
}

export type UseLoginResponse = UR3Token;
