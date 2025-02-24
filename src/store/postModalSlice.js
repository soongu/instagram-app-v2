// src/store/postModalSlice.js
import { createSlice } from "@reduxjs/toolkit";

const postModalSlice = createSlice({
  name: "postModal",
  initialState: {
    isOpen: false,
    postId: null,
  },
  reducers: {
    openPostModal: (state, action) => {
      state.isOpen = true;
      state.postId = action.payload;
    },
    closePostModal: (state) => {
      state.isOpen = false;
      state.postId = null;
    },
  },
});

export const { openPostModal, closePostModal } = postModalSlice.actions;
export default postModalSlice.reducer;
