import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import MockApp from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MockApp />
  </StrictMode>,
);
