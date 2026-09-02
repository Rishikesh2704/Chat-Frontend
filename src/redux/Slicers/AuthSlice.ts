import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
  currentUser: any;
};

const getStoredUser = () => {
    try {
        const user = localStorage.getItem("Current_User") 
        return user ? JSON.parse(user) : null
    } catch (error) {
        console.log("Failed to get current User from local storage", error);
        return null
    }
} 

const initialState: initialStateType = {
  currentUser:getStoredUser(),
};

const authSlicer = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      localStorage.setItem("Current_User", JSON.stringify(action.payload));
    },
    removeCurrentUser:(state) => {
        state.currentUser = null,
        localStorage.removeItem("Current_User")
    }
  },
});

export const { setCurrentUser, removeCurrentUser } = authSlicer.actions;

export default authSlicer.reducer;
