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

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch