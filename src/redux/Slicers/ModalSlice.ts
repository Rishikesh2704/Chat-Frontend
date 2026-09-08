import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type initialState = {
    viewModal:boolean,
    modalType:string,
    viewSearchModal:boolean,
    searchResults:User[] | [];
}

const initialState = {
    viewModal:false,
    modalType:"",
    viewSearchModal:false,
    searchResults:[],
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
        setModalType: (state, action:PayloadAction<string>) => {
            console.log("Redux-Modal Type: ", action.payload)
            return {
                ...state,
                modalType:action.payload,
            }
        }
        ,
        setViewSearchModal:(state, action:PayloadAction<boolean>) => {
            return{
                ...state,
                viewSearchModal:action.payload,
            }
        },
        setSearchResults:(state, action:PayloadAction<any>) => {
           return {
                ...state,
                searchResults:action.payload,
            }
        },
    }
})

export const { setViewModal, setModalType, setViewSearchModal, setSearchResults } = modalSlicer.actions

export default modalSlicer.reducer