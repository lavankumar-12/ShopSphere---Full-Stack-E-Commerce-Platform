import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');

const initialState = {
  user: null,
  token: token || null,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
        localStorage.setItem('token', token);
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  logoutUser,
  setAuthLoading,
  setAuthError,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
