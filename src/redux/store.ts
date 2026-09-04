import { configureStore } from '@reduxjs/toolkit'
import authReducer from './Slicers/AuthSlice.ts'
import chatReducer from './Slicers/ChatSlice.ts'
import modalReducer from './Slicers/ModalSlice.ts'

export const store = configureStore({
  reducer: {
    auth:authReducer,
    chat:chatReducer,
    modal:modalReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch