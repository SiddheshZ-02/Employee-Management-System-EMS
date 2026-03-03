import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { API_BASE_URL, SESSION_TIMEOUT_MS } from "@/constant/Config";
import type { AppDispatch, RootState } from "@/store";
// import { useDispatch } from 'react-redux';

export type UserRole = "Admin" | "Employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  sessionExpiry: number | null;
  sessionExpired: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  sessionExpiry: null,
  sessionExpired: false,
};

// const dispatch =useDispatch()
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      const expiry = Date.now() + SESSION_TIMEOUT_MS;
      state.sessionExpiry = expiry;
      state.sessionExpired = false;

      // Persist to localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("sessionExpiry", String(expiry));
    },
    loginFailure: (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.sessionExpiry = null;
      state.sessionExpired = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.sessionExpiry = null;
      state.sessionExpired = false;

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("sessionExpiry");
    },
    loadUserFromStorage: (state) => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const expiryStr = localStorage.getItem("sessionExpiry");
      const expiry = expiryStr ? Number(expiryStr) : null;

      if (token && userStr && expiry && expiry > Date.now()) {
        state.token = token;
        state.user = JSON.parse(userStr);
        state.isAuthenticated = true;
        state.sessionExpiry = expiry;
        state.sessionExpired = false;
      } else {
        if (token || userStr) {
          state.sessionExpired = true;
        }
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.sessionExpiry = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("sessionExpiry");
      }
    },
    signup: (
      state,
      action: PayloadAction<{
        email: string;
        password: string;
        name: string;
        role: UserRole;
        department: string;
      }>
    ) => {
      const newUser: User = {
        id: Date.now().toString(),
        email: action.payload.email,
        name: action.payload.name,
        role: action.payload.role,
        department: action.payload.department,
      };

      const token = `token_${Date.now()}`;
      const expiry = Date.now() + SESSION_TIMEOUT_MS;

      state.user = newUser;
      state.token = token;
      state.isAuthenticated = true;
      state.sessionExpiry = expiry;
      state.sessionExpired = false;

      // Persist to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("sessionExpiry", String(expiry));
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    refreshSession: (state) => {
      if (state.isAuthenticated) {
        const expiry = Date.now() + SESSION_TIMEOUT_MS;
        state.sessionExpiry = expiry;
        localStorage.setItem("sessionExpiry", String(expiry));
      }
    },
    expireSession: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.sessionExpired = true;
      state.sessionExpiry = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("sessionExpiry");
    },
    clearSessionExpired: (state) => {
      state.sessionExpired = false;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      try { localStorage.setItem('token', action.payload); } catch {}
    },
  },
});

// Async login action with real API integration
export const loginAsync =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    dispatch(loginStart());

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        dispatch(loginFailure());
        return;
      }

      const data = await response.json();

      if (!data?.success || !data?.data) {
        dispatch(loginFailure());
        return;
      }

      const apiUser = data.data;
      const mappedRole: UserRole =
        apiUser.role === "admin" || apiUser.role === "manager"
          ? "Admin"
          : "Employee";

      const user: User = {
        id: apiUser._id,
        email: apiUser.email,
        name: apiUser.name,
        role: mappedRole,
        department: apiUser.department,
        phone: apiUser.phone,
      };

      const token: string = apiUser.token;
      const refreshToken: string | undefined = apiUser.refreshToken;
      if (refreshToken) {
        try { localStorage.setItem("refreshToken", refreshToken); } catch {}
      }

      dispatch(loginSuccess({ user, token }));
    } catch (error) {
      console.error("Authentication error:", error);
      dispatch(loginFailure());
    }
  };

export const logoutAsync =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const { token } = getState().auth;
    if (token) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => undefined);
    }
    dispatch(logout());
  };

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  loadUserFromStorage,
  signup,
  updateProfile,
  refreshSession,
  expireSession,
  clearSessionExpired,
  setToken,
} = authSlice.actions;
export default authSlice.reducer;
