import { createSlice } from "@reduxjs/toolkit";

const searchPanelSlice = createSlice({
  name: "searchPanel",
  initialState: {
    isOpen: false,
  },
  reducers: {
    openSearchPanel: (state) => {
      state.isOpen = true;
    },
    closeSearchPanel: (state) => {
      state.isOpen = false;
    },
    toggleSearchPanel: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openSearchPanel, closeSearchPanel, toggleSearchPanel } = searchPanelSlice.actions;
export default searchPanelSlice.reducer;
