// src/store/createFeedModalSlice.js
import { createSlice } from "@reduxjs/toolkit";

const createFeedModalSlice = createSlice({
  name: "createFeedModal",
  initialState: {
    isOpen: false,
  },
  reducers: {
    openCreateFeedModal: (state) => {
      state.isOpen = true;
    },
    closeCreateFeedModal: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openCreateFeedModal, closeCreateFeedModal } = createFeedModalSlice.actions;
export default createFeedModalSlice.reducer;
