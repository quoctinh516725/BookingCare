import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    username: "",
    email: "",
    access_token: "",
  },
  reducers: {
    setUser: (state, action) => {
      const { username, email } = action.payload;
      state.username = username;
      state.email = email;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUser } = userSlice.actions;

export default userSlice.reducer;
