import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Auth/AuthSlice.ts";
import chatReducer from "./Chat/ChatSlice.ts";
import modalReducer from "./Modal/ModalSlice.ts";
import { authApi } from "./Auth/authQuerySlice.ts";
import { chatApi } from "./Chat/chatQuerySlice.ts";
import { modalApi } from "./Modal/modalQuerySlice.ts";
import { groupApi } from "./Group/groupQuerySlice.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    modal: modalReducer,
    [authApi.reducerPath]:authApi.reducer,
    [chatApi.reducerPath]:chatApi.reducer,
    [modalApi.reducerPath]:modalApi.reducer,
    [groupApi.reducerPath]:groupApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, chatApi.middleware, modalApi.middleware, groupApi.middleware,),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
