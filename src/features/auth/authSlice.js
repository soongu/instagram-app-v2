// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    status: 'idle',
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.status = 'succeeded';
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
    },
    loginFailure: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

// 로그인 액션 생성자
export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());

    const response = await authApi.login(credentials);
    dispatch(loginSuccess(response.data));
    return response.data;

  } catch (error) {
    const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
    dispatch(loginFailure(errorMessage));
    throw error;
  }
};

export default authSlice.reducer;