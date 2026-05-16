import { lazy } from "react";
import { Route } from "react-router-dom";

const AuthPage = lazy(() =>
  import("@/features/auth/pages/AuthPage").then((m) => ({ default: m.AuthPage }))
);
const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/pages/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  }))
);

export const authRoutes = (
  <>
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
  </>
);
