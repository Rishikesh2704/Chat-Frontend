import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Auth/AuthSlice.ts";
import chatReducer from "./Chat/ChatSlice.ts";
import modalReducer from "./Modal/ModalSlice.ts";
import { authApi } from "./AuthQuery/authQuerySlice.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    modal: modalReducer,
    [authApi.reducerPath]:authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
