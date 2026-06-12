import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { User } from "./lib/context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <User>
      <User>

      <App />
      </User>
    </User>
  </StrictMode>,
);
