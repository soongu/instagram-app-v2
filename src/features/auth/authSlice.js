// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import defaultProfileImage from '../../assets/images/default-profile.svg';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: localStorage.getItem('accessToken'),
    username: '',
    profileImage: defaultProfileImage
  },
  reducers: {
    setToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.username = action.payload.username;
      state.profileImage = action.payload.profileImage;

      localStorage.setItem('accessToken', action.payload.accessToken);
    },
    clearToken: (state) => {
      state.accessToken = null;
      state.username = '';
      state.profileImage = defaultProfileImage;
      localStorage.removeItem('accessToken');
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;