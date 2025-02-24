import {createSlice} from '@reduxjs/toolkit';

const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    // feedId별 댓글 수 저장 (예: { 123: 5, 456: 0, ... })
    commentCounts: {}
  },
  reducers: {
    incrementCommentCount: (state, action) => {
      const {feedId, commentCount} = action.payload;
      state.commentCounts[feedId] = commentCount;
    }
  }
});

export const { incrementCommentCount} = commentSlice.actions;
export default commentSlice.reducer;
