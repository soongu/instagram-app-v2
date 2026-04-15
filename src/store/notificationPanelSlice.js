import { createSlice } from "@reduxjs/toolkit";

const notificationPanelSlice = createSlice({
  name: "notificationPanel",
  initialState: {
    isOpen: false,
  },
  reducers: {
    openNotificationPanel: (state) => {
      state.isOpen = true;
    },
    closeNotificationPanel: (state) => {
      state.isOpen = false;
    },
    toggleNotificationPanel: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openNotificationPanel, closeNotificationPanel, toggleNotificationPanel } =
  notificationPanelSlice.actions;
export default notificationPanelSlice.reducer;
