export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
  },
  attendance: {
    today: "/api/attendance/today",
  },
} as const;
