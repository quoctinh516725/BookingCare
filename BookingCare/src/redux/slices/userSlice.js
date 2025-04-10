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
    permissions: [],
    isLoggedIn: false,
    lastUpdated: null,
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
          permissions,
        } = action.payload;
        
        state.id = id || null;
        state.username = username || null;
        state.email = email || null;
        state.firstName = firstName || null;
        state.lastName = lastName || null;
        state.role = role || null;
        state.access_token = access_token || null;
        state.fullName = `${firstName || ""} ${lastName || ""}`.trim();
        state.phone = phoneNumber || null;
        
        state.permissions = permissions || [];
        
        state.isLoggedIn = !!id && !!access_token;
        
        state.lastUpdated = new Date().toISOString();
      }
    },
    updateUserInfo: (state, action) => {
      if (action.payload) {
        const { firstName, lastName, email, phone, permissions, role } = action.payload;
        if (firstName !== undefined) state.firstName = firstName;
        if (lastName !== undefined) state.lastName = lastName;
        if (email !== undefined) state.email = email;
        if (phone !== undefined) state.phone = phone;
        if (permissions !== undefined) state.permissions = permissions;
        if (role !== undefined) state.role = role;
        
        state.fullName = `${state.firstName || ""} ${state.lastName || ""}`.trim();
        
        state.lastUpdated = new Date().toISOString();
      }
    },
    setUserPermissions: (state, action) => {
      if (action.payload && Array.isArray(action.payload)) {
        state.permissions = action.payload;
        state.lastUpdated = new Date().toISOString();
      }
    },
    setUserRole: (state, action) => {
      if (action.payload) {
        state.role = action.payload;
        state.lastUpdated = new Date().toISOString();
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
      state.permissions = [];
      state.isLoggedIn = false;
      state.lastUpdated = new Date().toISOString();
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUser, logout, updateUserInfo, setUserPermissions, setUserRole } = userSlice.actions;

export default userSlice.reducer;
