import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type stateType = {
    allMessages:AllMessageType[] | [],
    selectedUser: User | Group | null
}

const initialState:stateType = {
    allMessages:[],
    selectedUser:null,
}

const chatSlicer = createSlice({
    name:"Chat",
    initialState,
    reducers:{
        setAllMessages: (state, action:PayloadAction<AllMessageType>) =>{
            state.allMessages=[...state.allMessages,action.payload]
        },
        setSelectedUser: (state, action:PayloadAction<User>) => {
            console.log("Redux Slice: ", action)
            state.selectedUser = action.payload
        }
    }
})

export const { setAllMessages, setSelectedUser } = chatSlicer.actions;
export default chatSlicer.reducer