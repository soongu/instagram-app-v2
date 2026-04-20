import { createSlice } from '@reduxjs/toolkit';

const dmSlice = createSlice({
  name: 'dm',
  initialState: {
    selectedConversationId: null,
    unreadByConversationId: {},
  },
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversationId = action.payload;
    },
    clearSelectedConversation: (state) => {
      state.selectedConversationId = null;
    },
    setUnread: (state, action) => {
      const { conversationId, count } = action.payload;
      if (count > 0) state.unreadByConversationId[conversationId] = count;
      else delete state.unreadByConversationId[conversationId];
    },
    incrementUnread: (state, action) => {
      const conversationId = action.payload;
      state.unreadByConversationId[conversationId] =
        (state.unreadByConversationId[conversationId] || 0) + 1;
    },
    clearUnread: (state, action) => {
      delete state.unreadByConversationId[action.payload];
    },
  },
});

export const {
  setSelectedConversation,
  clearSelectedConversation,
  setUnread,
  incrementUnread,
  clearUnread,
} = dmSlice.actions;

export default dmSlice.reducer;
