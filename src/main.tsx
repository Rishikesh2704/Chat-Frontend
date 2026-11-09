import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { User } from "./lib/context.tsx";
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'
import ToastWrapper from "./utils/ToastWrapper.tsx";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
    <User>
      <App />
      <ToastWrapper/>
    </User>
    </Provider>
  </StrictMode>,
);
