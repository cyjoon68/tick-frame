import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { installMockServer } from "@/shared/api";
import App from "./app";
import "./styles.css";

installMockServer();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
