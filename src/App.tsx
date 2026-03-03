import { Provider } from "react-redux";
import { Suspense, lazy } from "react";
import { store } from "@/store";
import { Toaster as Sonner, Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import SessionTimeoutManager from "@/components/layout/SessionTimeoutManager";

const AuthPage = lazy(() =>
  import("@/pages/Auth").then((m) => ({ default: m.Auth }))
);
const DashboardLayoutLazy = lazy(() =>
  import("@/components/layout/DashboardLayout").then((m) => ({
    default: m.DashboardLayout,
  }))
);
const ProtectedRouteLazy = lazy(() =>
  import("@/components/layout/ProtectedRoute").then((m) => ({
    default: m.ProtectedRoute,
  }))
);
const AdminDashboardLazy = lazy(() =>
  import("@/pages/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  }))
);
const EmployeeManagementLazy = lazy(() =>
  import("@/pages/admin/EmployeeManagement").then((m) => ({
    default: m.EmployeeManagement,
  }))
);
const DepartmentManagementLazy = lazy(() =>
  import("@/pages/admin/DepartmentManagement").then((m) => ({
    default: m.DepartmentManagement,
  }))
);
const UserManagementLazy = lazy(() =>
  import("@/pages/admin/UserManagement").then((m) => ({
    default: m.UserManagement,
  }))
);
const AdminLeaveRequestsLazy = lazy(() =>
  import("@/pages/admin/AdminLeaveRequests").then((m) => ({
    default: m.AdminLeaveRequests,
  }))
);
const AdminAttendanceLazy = lazy(() =>
  import("@/pages/admin/AdminAttendance").then((m) => ({
    default: m.AdminAttendance,
  }))
);
const AdminAccessLazy = lazy(() =>
  import("@/pages/admin/AdminAccess").then((m) => ({
    default: m.AdminAccess,
  }))
);
const EmployeeAttendanceDetailsLazy = lazy(() =>
  import("@/pages/admin/EmployeeAttendanceDetails").then((m) => ({
    default: m.EmployeeAttendanceDetails,
  }))
);
const EmployeeDetailsLazy = lazy(() =>
  import("@/pages/admin/EmployeeDetails").then((m) => ({
    default: m.EmployeeDetails,
  }))
);
const OfficeLocationPageLazy = lazy(() =>
  import("@/pages/admin/OfficeLocation").then((m) => ({
    default: m.OfficeLocationPage,
  }))
);
const EmployeeDashboardLazy = lazy(() =>
  import("@/pages/employee/EmployeeDashboard").then((m) => ({
    default: m.EmployeeDashboard,
  }))
);
const AttendanceTrackingLazy = lazy(() =>
  import("@/pages/employee/AttendanceTracking")
);
const LeaveManagementLazy = lazy(() =>
  import("@/pages/employee/LeaveManagement")
);
const ProfileManagementLazy = lazy(() =>
  import("@/pages/employee/ProfileManagement").then((m) => ({
    default: m.ProfileManagement,
  }))
);
const NotFoundLazy = lazy(() => import("@/pages/NotFound"));
const ForgotPasswordLazy = lazy(() =>
  import("@/pages/ForgotPassword").then((m) => ({
    default: m.ForgotPassword,
  }))
);
const ResetPasswordLazy = lazy(() =>
  import("@/pages/ResetPassword").then((m) => ({
    default: m.ResetPassword,
  }))
);

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ems-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <SessionTimeoutManager />
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPasswordLazy />}
                />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPasswordLazy />}
                />
                <Route path="/" element={<Navigate to="/auth" replace />} />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRouteLazy requiredRole="Admin">
                      <DashboardLayoutLazy />
                    </ProtectedRouteLazy>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboardLazy />} />
                  <Route
                    path="employees"
                    element={<EmployeeManagementLazy />}
                  />
                  <Route
                    path="employees/:id"
                    element={<EmployeeDetailsLazy />}
                  />
                  <Route
                    path="departments"
                    element={<DepartmentManagementLazy />}
                  />
                  <Route path="users" element={<UserManagementLazy />} />
                  <Route
                    path="leave-requests"
                    element={<AdminLeaveRequestsLazy />}
                  />
                  <Route path="attendance" element={<AdminAttendanceLazy />} />
                  <Route
                    path="attendance/:id"
                    element={<EmployeeAttendanceDetailsLazy />}
                  />
                  <Route
                    path="office-location"
                    element={<OfficeLocationPageLazy />}
                  />
                  <Route path="weekoff" element={<AdminAccessLazy />} />
                </Route>

                <Route
                  path="/employee"
                  element={
                    <ProtectedRouteLazy requiredRole="Employee">
                      <DashboardLayoutLazy />
                    </ProtectedRouteLazy>
                  }
                >
                  <Route
                    path="dashboard"
                    element={<EmployeeDashboardLazy />}
                  />
                  <Route
                    path="attendance"
                    element={<AttendanceTrackingLazy />}
                  />
                  <Route path="leave" element={<LeaveManagementLazy />} />
                  <Route
                    path="profile"
                    element={<ProfileManagementLazy />}
                  />
                </Route>

                <Route path="*" element={<NotFoundLazy />} />
              </Routes>
            </Suspense>
          </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
