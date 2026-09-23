import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "user" | "librarian" | "staff";
  avatar?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: { [module: string]: ("READ" | "WRITE" | "UPDATE" | "DELETE" )[] };
}

interface AuthState {
  user: User | null;
  loader: boolean;
  accessToken: string | null;
  isAdmin: boolean;
}

const initialState: AuthState = {
  user: null,
  loader: true,
  accessToken: null,
  isAdmin: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ accessToken?: string; user: User }>,
    ) => {
      state.accessToken = action.payload.accessToken || null;
      state.user = action.payload.user;
      state.loader = false;
    },
    removeUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.loader = false;
    },
  },
});

export default authSlice;

export const { setUser, removeUser } = authSlice.actions;
