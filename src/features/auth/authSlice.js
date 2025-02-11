// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: localStorage.getItem('accessToken'),
  },
  reducers: {
    setToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    },
    clearToken: (state) => {
      state.accessToken = null;
      localStorage.removeItem('accessToken');
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;