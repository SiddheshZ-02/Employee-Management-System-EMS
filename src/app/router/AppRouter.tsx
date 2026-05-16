import { Suspense, lazy } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import SessionTimeoutManager from "@/app/layouts/SessionTimeoutManager";
import { authRoutes } from "@/app/router/routes/authRoutes";
import { adminRoutes } from "@/app/router/routes/adminRoutes";
import { ownerRoutes } from "@/app/router/routes/ownerRoutes";
import { employeeRoutes } from "@/app/router/routes/employeeRoutes";

const NotFoundPage = lazy(() => import("@/app/pages/NotFoundPage"));

export function AppRouter() {
  return (
    <HashRouter>
      <SessionTimeoutManager />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center p-4 text-muted-foreground">
            Loading...
          </div>
        }
      >
        <Routes>
          {authRoutes}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          {adminRoutes}
          {ownerRoutes}
          {employeeRoutes}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
