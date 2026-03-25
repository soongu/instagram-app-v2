// src/store/postModalSlice.js
import { createSlice } from "@reduxjs/toolkit";

const postModalSlice = createSlice({
  name: "postModal",
  initialState: {
    isOpen: false,
    postId: null,
    context: 'feed',
  },
  reducers: {
    openPostModal: (state, action) => {
      state.isOpen = true;
      if (typeof action.payload === 'object') {
        state.postId = action.payload.id;
        state.context = action.payload.context || 'feed';
      } else {
        state.postId = action.payload;
        state.context = 'feed';
      }
    },
    closePostModal: (state) => {
      state.isOpen = false;
      state.postId = null;
      state.context = 'feed';
    },
  },
});

export const { openPostModal, closePostModal } = postModalSlice.actions;
export default postModalSlice.reducer;
