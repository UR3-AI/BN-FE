import type { UR3Token } from "../../model";

export interface UseRegisterRequest {
  email: string;
  password: string;
}

export type UseRegisterResponse = UR3Token;
