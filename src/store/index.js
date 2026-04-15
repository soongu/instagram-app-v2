// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import postModalReducer from "./postModalSlice";
import createFeedModalReducer from "./createFeedModalSlice";
import likeReducer from "./likeSlice";
import commentReducer from "./commentSlice";
import toastReducer from "./toastSlice.js";
import searchPanelReducer from "./searchPanelSlice.js";
import notificationPanelReducer from "./notificationPanelSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    postModal: postModalReducer,
    createFeedModal: createFeedModalReducer,
    likes: likeReducer,
    comments: commentReducer,
    toast: toastReducer,
    searchPanel: searchPanelReducer,
    notificationPanel: notificationPanelReducer,
  },
});