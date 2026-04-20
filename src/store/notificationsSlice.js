import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    unreadCount: 0,
  },
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = Math.max(0, action.payload | 0);
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const {
  setUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  clearUnreadCount,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
