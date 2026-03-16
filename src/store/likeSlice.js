// features/likeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  likes: {}, // { [postId]: { liked: boolean, likeCount: number } }
  pendingPostIds: {}, // { [postId]: true } — 토글 요청 중인 글 (중복 요청 방지)
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
      state.pendingPostIds = {};
    },
    setLikePending: (state, action) => {
      state.pendingPostIds[action.payload] = true;
    },
    clearLikePending: (state, action) => {
      delete state.pendingPostIds[action.payload];
    },
  },
});

export const { updateLikeStatus, clearLikes, setLikePending, clearLikePending } = likeSlice.actions;
export default likeSlice.reducer;
