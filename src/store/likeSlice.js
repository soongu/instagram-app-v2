// features/likeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  likes: {} // { [postId]: { liked: boolean, likeCount: number } }
};

const likeSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    updateLikeStatus: (state, action) => {
      const { postId, liked, likeCount } = action.payload;
      state.likes[postId] = { liked, likeCount };
    },
    clearLikes: (state) => {
      state.likes = {};
    },
  },
});

export const { updateLikeStatus, clearLikes } = likeSlice.actions;
export default likeSlice.reducer;
