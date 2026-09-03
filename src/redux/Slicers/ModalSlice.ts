import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type initialState = {
    viewModal:boolean,
}

const initialState = {
    viewModal:false,
}

const modalSlicer = createSlice({
    name:"Modals",
    initialState,
    reducers:{
        setViewModal: (state, action:PayloadAction<boolean>) => {
            return {
                ...state, 
                viewModal:action.payload,
            }
        },
    }
})

export const { setViewModal } = modalSlicer.actions

export default modalSlicer.reducer