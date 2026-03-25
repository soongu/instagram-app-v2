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
    },
    // 댓글 생성 등으로 인해 "정확한 count 값을 응답에서 못받는" 경우 대비
    addCommentCount: (state, action) => {
      const { feedId, delta = 1 } = action.payload;
      const current = state.commentCounts[feedId] ?? 0;
      state.commentCounts[feedId] = current + delta;
    },
  }
});

export const { incrementCommentCount, addCommentCount } = commentSlice.actions;
export default commentSlice.reducer;
