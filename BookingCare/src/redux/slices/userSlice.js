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
    phone: "",
  },
  reducers: {
    setUser: (state, action) => {
      if (action.payload) {
        const {
          id,
          username,
          email,
          firstName,
          lastName,
          role,
          access_token,
          phoneNumber,
        } = action.payload;
        state.id = id || null;
        state.username = username || null;
        state.email = email || null;
        state.firstName = firstName || null;
        state.lastName = lastName || null;
        state.role = role || null;
        state.access_token = access_token || null;
        state.fullName = `${firstName || null} ${lastName || null}`.trim();
        state.phone = phoneNumber || null;
      }
    },
    updateUserInfo: (state, action) => {
      if (action.payload) {
        const { firstName, lastName, email, phone } = action.payload;
        if (firstName !== undefined) state.firstName = firstName;
        if (lastName !== undefined) state.lastName = lastName;
        if (email !== undefined) state.email = email;
        if (phone !== undefined) state.phone = phone;
        state.fullName = `${state.firstName || ""} ${state.lastName || ""}`.trim();
      }
    },
    logout: (state) => {
      state.id = "";
      state.username = "";
      state.email = "";
      state.firstName = "";
      state.lastName = "";
      state.fullName = "";
      state.role = "";
      state.access_token = "";
      state.phone = "";
    },
    
  },
});

// Action creators are generated for each case reducer function
export const { setUser, logout, updateUserInfo } = userSlice.actions;

export default userSlice.reducer;
