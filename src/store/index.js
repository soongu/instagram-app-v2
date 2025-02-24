// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import postModalReducer from "./postModalSlice";
import likeReducer from "./likeSlice";
import commentReducer from "./commentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    postModal: postModalReducer,
    likes: likeReducer,
    comments: commentReducer,
  },
});