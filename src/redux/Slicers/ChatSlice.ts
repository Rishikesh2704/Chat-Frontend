import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { enableMapSet } from "immer";

enableMapSet();
type stateType = {
  users: User[] | Group[];
  showDetails:boolean,
  onlineUsers: any;
  selectedUser: User | Group | null;
  allMessages: AllMessageType[] | [];
};

const initialState: stateType = {
  users: [],
  showDetails:false,
  onlineUsers: {},
  selectedUser: null,
  allMessages: [],
};

const chatSlicer = createSlice({
  name: "Chat",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        users: [...action.payload],
      };
    },

    setShowDetails: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        showDetails: action.payload,
      };
    },

    setOnlineUsers: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        onlineUsers: { ...action.payload },
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

    updateReaction: (state, action: PayloadAction<AllMessageType>) => {
      const reactedMessage = action.payload;
      const updatedMessages = state.allMessages.map((message) => {
        if (message._id === reactedMessage._id) {
          return { ...message, reactions: reactedMessage.reactions };
        } else return message;
      });

      return {
        ...state,
        allMessages: updatedMessages,
      };
    },

    updateSeenMessage: (state, action: PayloadAction<AllMessageType>) => {
      const seenMessage = action.payload;
      const updatedMessages = state.allMessages.map((messages) => {
        if (seenMessage._id === messages._id) {
          return { ...messages, seen: seenMessage.seen };
        } else return messages;
      });

      return {
        ...state,
        allMessages: updatedMessages,
      };
    },
  },
});

export const {
  setUsers,
  setShowDetails,
  setOnlineUsers,
  setAllMessages,
  prependMessages,
  addNewMessage,
  setSelectedUser,
  updateReaction,
  updateSeenMessage,
} = chatSlicer.actions;

export default chatSlicer.reducer;
