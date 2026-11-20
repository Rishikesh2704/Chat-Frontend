import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type initialState = {
  viewModal: boolean;
  modalType: string;
  videoCallModal: {
    view: boolean;
    isAudio: boolean;
    isVideo: boolean;
  };
  viewSearchModal: boolean;
  searchResults: User[] | [];
};

const initialState = {
  viewModal: false,
  modalType: "",
  videoCallModal: {
    view: false,
    isAudio: false,
    isVideo: false,
  },
  viewSearchModal: false,
  searchResults: [],
};

const modalSlicer = createSlice({
  name: "Modals",
  initialState,
  reducers: {
    setViewModal: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        viewModal: action.payload,
      };
    },
    setModalType: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        modalType: action.payload,
      };
    },

    setVideoCallModal: (
      state,
      action: PayloadAction<
        { view: boolean; isAudio: boolean; isVideo: boolean } | boolean
      >,
    ) => {
      let call = action.payload;
      if (call === false) {
        call = {
          view: false,
          isAudio: false,
          isVideo: false,
        };
      } else if ((call === true)) {
        call = {
          view: true,
          isAudio: true,
          isVideo: true,
        };
      }

      return {
        ...state,
        videoCallModal: call,
      };
    },

    setSearchResults: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        searchResults: action.payload,
      };
    },
  },
});

export const {
  setViewModal,
  setModalType,
  setVideoCallModal,
  setSearchResults,
} = modalSlicer.actions;

export default modalSlicer.reducer;
