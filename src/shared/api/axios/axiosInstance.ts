import axios from "axios";

import { SECOND } from "@shared/constants";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  timeout: 10 * SECOND,
  headers: {
    "Content-Type": "application/json",
  },
});
