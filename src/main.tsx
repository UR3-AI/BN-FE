import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { registerApiInterceptors } from "@app/api";

import App from "./App.tsx";

registerApiInterceptors();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
