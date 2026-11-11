import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { User } from "./lib/context.tsx";
import { store } from "./redux/store.ts";
import { Provider } from "react-redux";
import ToastWrapper from "./utils/ToastWrapper.tsx";
import BoundaryWrapper from "./lib/BoundaryWrapper.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <User>
        <BoundaryWrapper>
          <App />
        </BoundaryWrapper>
        <ToastWrapper />
      </User>
    </Provider>
  </StrictMode>,
);
