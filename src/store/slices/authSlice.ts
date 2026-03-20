import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { API_BASE_URL, SESSION_TIMEOUT_MS } from "@/constant/Config";
import type { AppDispatch, RootState } from "@/store";
// import { useDispatch } from 'react-redux';

export type UserRole = "Owner" | "Admin" | "Employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  sessionExpiry: number | null;
  sessionExpired: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
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
      action: PayloadAction<{ user: User; token: string; refreshToken?: string }>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      const expiry = Date.now() + SESSION_TIMEOUT_MS;
      state.sessionExpiry = expiry;
      state.sessionExpired = false;

      localStorage.setItem("ems_token", action.payload.token);
      if (action.payload.refreshToken) {
        localStorage.setItem("ems_refreshToken", action.payload.refreshToken);
      }
      localStorage.setItem("ems_user", JSON.stringify(action.payload.user));
      localStorage.setItem("ems_sessionExpiry", String(expiry));
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("sessionExpiry");
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

      localStorage.removeItem("ems_token");
      localStorage.removeItem("ems_user");
      localStorage.removeItem("ems_sessionExpiry");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("sessionExpiry");
    },
    loadUserFromStorage: (state) => {
      const token =
        localStorage.getItem("ems_token") || localStorage.getItem("token");
      const refreshToken =
        localStorage.getItem("ems_refreshToken") ||
        localStorage.getItem("refreshToken");
      const userStr =
        localStorage.getItem("ems_user") || localStorage.getItem("user");
      const expiryStr =
        localStorage.getItem("ems_sessionExpiry") ||
        localStorage.getItem("sessionExpiry");
      const expiry = expiryStr ? Number(expiryStr) : null;

      if (token && userStr && expiry && expiry > Date.now()) {
        state.token = token;
        state.refreshToken = refreshToken;
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
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.sessionExpiry = null;
        localStorage.removeItem("ems_token");
        localStorage.removeItem("ems_refreshToken");
        localStorage.removeItem("ems_user");
        localStorage.removeItem("ems_sessionExpiry");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
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

      localStorage.setItem("ems_token", token);
      localStorage.setItem("ems_user", JSON.stringify(newUser));
      localStorage.setItem("ems_sessionExpiry", String(expiry));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("sessionExpiry");
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("ems_user", JSON.stringify(state.user));
      }
    },
    refreshSession: (state) => {
      if (state.isAuthenticated) {
        const expiry = Date.now() + SESSION_TIMEOUT_MS;
        state.sessionExpiry = expiry;
        localStorage.setItem("ems_sessionExpiry", String(expiry));
      }
    },
    expireSession: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.sessionExpired = true;
      state.sessionExpiry = null;
      localStorage.removeItem("ems_token");
      localStorage.removeItem("ems_user");
      localStorage.removeItem("ems_sessionExpiry");
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
      const expiry = Date.now() + SESSION_TIMEOUT_MS;
      state.sessionExpiry = expiry;
      localStorage.setItem("ems_token", action.payload);
      localStorage.setItem("ems_sessionExpiry", String(expiry));
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
      let mappedRole: UserRole = "Employee";

      if (apiUser.role === "owner") {
        mappedRole = "Owner";
      } else if (apiUser.role === "admin" || apiUser.role === "manager") {
        mappedRole = "Admin";
      }

      const user: User = {
        id: apiUser._id,
        email: apiUser.email,
        name: apiUser.name,
        role: mappedRole,
        companyId: apiUser.companyId,
        department: apiUser.department,
        phone: apiUser.phone,
      };

      const token: string = apiUser.token;
      const refreshToken: string | undefined = apiUser.refreshToken;

      dispatch(loginSuccess({ user, token, refreshToken }));
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
