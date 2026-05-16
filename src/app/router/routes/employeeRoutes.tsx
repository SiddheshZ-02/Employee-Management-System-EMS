import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";

const EmployeeDashboard = lazy(() =>
  import("@/features/dashboard/pages/EmployeeDashboard").then((m) => ({
    default: m.EmployeeDashboard,
  }))
);
const AttendanceTracking = lazy(
  () => import("@/features/attendance/pages/AttendanceTracking")
);
const LeaveManagement = lazy(
  () => import("@/features/leave/pages/LeaveManagement")
);
const ProfileManagement = lazy(() =>
  import("@/features/employees/pages/ProfileManagement").then((m) => ({
    default: m.ProfileManagement,
  }))
);
const EmployeeHolidays = lazy(() =>
  import("@/features/holidays/pages/Holidays").then((m) => ({
    default: m.EmployeeHolidays,
  }))
);

export const employeeRoutes = (
  <Route
    path="/employee"
    element={
      <ProtectedRoute requiredRole="Employee">
        <DashboardLayout />
      </ProtectedRoute>
    }
  >
    <Route path="dashboard" element={<EmployeeDashboard />} />
    <Route path="attendance" element={<AttendanceTracking />} />
    <Route path="leave" element={<LeaveManagement />} />
    <Route path="holidays" element={<EmployeeHolidays />} />
    <Route path="profile" element={<ProfileManagement />} />
  </Route>
);
