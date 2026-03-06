// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: null,
    user: null
  },
  reducers: {
    setToken: (state, action) => {

      state.accessToken = action.payload.accessToken;
      state.user = {
        username: action.payload.username,
        profileImage: action.payload.profileImage
      };
      localStorage.setItem('isLoggedIn', 'true');
    },
    clearToken: (state) => {
      state.accessToken = null;
      state.user = null;
      localStorage.removeItem('isLoggedIn');
    },
    // 프로필 이미지만 변경하는 액션 추가
    updateProfileImage: (state, action) => {
      if (state.user) {
        state.user.profileImage = action.payload;
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    refreshAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
  },
});

export const { setToken, clearToken, updateProfileImage, setUser, refreshAccessToken } = authSlice.actions;
export default authSlice.reducer;