import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type stateType = {
  users:User[] | Group[],
  onlineUsers: any;
  selectedUser: User | Group | null;
  allMessages: AllMessageType[] | [];
};

const initialState: stateType = {
  users:[],
  onlineUsers: {},
  selectedUser: null,
  allMessages: [],
  
};

const chatSlicer = createSlice({
  name: "Chat",
  initialState,
  reducers: {

    setUsers:(state, action: PayloadAction<any>) => {
      return {
        ...state, 
        users:[...action.payload]
      }
    },

    setOnlineUsers: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        onlineUsers: {...action.payload},
      };
    },

    setAllMessages: (state, action: PayloadAction<any>) => {
      return { ...state, allMessages: [...action.payload] };
    },

    prependMessages: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        allMessages: [...action.payload, ...state.allMessages],
      };
    },

    addNewMessage: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        allMessages: [...state.allMessages, action.payload],
      };
    },

    setSelectedUser: (state, action: PayloadAction<User>) => {
      return { ...state, selectedUser: action.payload };
    },
  },
});

export const {
  setUsers,
  setOnlineUsers,
  setAllMessages,
  prependMessages,
  addNewMessage,
  setSelectedUser,
} = chatSlicer.actions;

export default chatSlicer.reducer;
