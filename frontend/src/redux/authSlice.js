import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        isAuthenticated: false,
        isDark: false, // 🌙 Naya Dark Mode State
    },
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
        toggleTheme: (state) => {
            state.isDark = !state.isDark; // 🌓 Theme Switcher
        }
    }
});

export const { loginSuccess, logout, toggleTheme } = authSlice.actions;
export default authSlice.reducer;