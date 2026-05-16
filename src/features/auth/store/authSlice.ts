import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { SESSION_TIMEOUT_MS } from "@/constants/config";
import type { AppDispatch, RootState } from "@/app/store";
import {
  loginRequest,
  logoutRequest,
  mapApiUserToUser,
} from "@/features/auth/api/authApi";
import type { AuthState, User, UserRole } from "@/features/auth/types";

export type { UserRole, User, AuthState };

const initialState: AuthState = {
  user: null,
  timezone: "Asia/Kolkata",
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
      action: PayloadAction<{ user: User; token: string; refreshToken?: string; timezone?: string }>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.timezone = action.payload.timezone || action.payload.user.timezone || "Asia/Kolkata";
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
      localStorage.setItem("ems_user", JSON.stringify({ ...action.payload.user, timezone: state.timezone }));
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
        const user = JSON.parse(userStr);
        state.user = user;
        state.timezone = user.timezone || "Asia/Kolkata";
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

export const loginAsync =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    dispatch(loginStart());
    try {
      const apiUser = await loginRequest(email, password);
      if (!apiUser) {
        dispatch(loginFailure());
        return;
      }
      const user = mapApiUserToUser(apiUser);
      dispatch(
        loginSuccess({
          user,
          token: apiUser.token,
          refreshToken: apiUser.refreshToken,
        })
      );
    } catch (error) {
      console.error("Authentication error:", error);
      dispatch(loginFailure());
    }
  };

export const logoutAsync =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const { token } = getState().auth;
    if (token) await logoutRequest(token);
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
