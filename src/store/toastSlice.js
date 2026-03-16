// src/store/toastSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: '',
  type: 'default', // 'default' | 'error'
  isVisible: false,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action) => {
      const payload = action.payload;
      if (typeof payload === 'string') {
        state.message = payload;
        state.type = 'default';
      } else {
        state.message = payload?.message ?? '';
        state.type = payload?.type ?? 'default';
      }
      state.isVisible = true;
    },
    hideToast: (state) => {
      state.isVisible = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
