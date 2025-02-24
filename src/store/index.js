// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import postModalReducer from "./postModalSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    postModal: postModalReducer,
  },
});