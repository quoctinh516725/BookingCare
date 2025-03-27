import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    id: "",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    fullName: "",
    role: "",
    access_token: "",
  },
  reducers: {
    setUser: (state, action) => {
      if (action.payload) {
        const {
          username,
          email,
          access_token,
        } = action.payload;
        state.username = username || "";
        state.email = email || "";
        state.access_token = access_token || "";
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUser } = userSlice.actions;

export default userSlice.reducer;
