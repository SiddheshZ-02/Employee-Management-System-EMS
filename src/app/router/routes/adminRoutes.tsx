import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";

const AdminDashboard = lazy(() =>
  import("@/features/dashboard/pages/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  }))
);
const EmployeeManagement = lazy(() =>
  import("@/features/employees/pages/EmployeeManagement").then((m) => ({
    default: m.EmployeeManagement,
  }))
);
const EmployeeDetails = lazy(() =>
  import("@/features/employees/pages/EmployeeDetails").then((m) => ({
    default: m.EmployeeDetails,
  }))
);
const DepartmentManagement = lazy(() =>
  import("@/features/departments/pages/DepartmentManagement").then((m) => ({
    default: m.DepartmentManagement,
  }))
);
const AdminLeaveRequests = lazy(() =>
  import("@/features/leave/pages/AdminLeaveRequests").then((m) => ({
    default: m.AdminLeaveRequests,
  }))
);
const AdminAttendance = lazy(() =>
  import("@/features/attendance/pages/AdminAttendance").then((m) => ({
    default: m.AdminAttendance,
  }))
);
const AdminAccess = lazy(() =>
  import("@/features/settings/pages/AdminAccess").then((m) => ({
    default: m.AdminAccess,
  }))
);
const CompanyHolidays = lazy(() =>
  import("@/features/holidays/pages/CompanyHolidays").then((m) => ({
    default: m.CompanyHolidays,
  }))
);
const CompanyWeekOff = lazy(() =>
  import("@/features/settings/pages/CompanyWeekOff").then((m) => ({
    default: m.CompanyWeekOff,
  }))
);
const LeaveAllocation = lazy(() =>
  import("@/features/leave/pages/LeaveAllocation").then((m) => ({
    default: m.LeaveAllocation,
  }))
);
const EmployeeAttendanceDetails = lazy(() =>
  import("@/features/attendance/pages/EmployeeAttendanceDetails").then((m) => ({
    default: m.EmployeeAttendanceDetails,
  }))
);
const OfficeLocationPage = lazy(() =>
  import("@/features/settings/pages/OfficeLocation").then((m) => ({
    default: m.OfficeLocationPage,
  }))
);
const AdminSupportTickets = lazy(() =>
  import("@/features/support/pages/SupportTickets").then((m) => ({
    default: m.AdminSupportTickets,
  }))
);

export const adminRoutes = (
  <Route
    path="/admin"
    element={
      <ProtectedRoute requiredRole="Admin">
        <DashboardLayout />
      </ProtectedRoute>
    }
  >
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="employees" element={<EmployeeManagement />} />
    <Route path="employees/:id" element={<EmployeeDetails />} />
    <Route path="departments" element={<DepartmentManagement />} />
    <Route path="leave-requests" element={<AdminLeaveRequests />} />
    <Route path="attendance" element={<AdminAttendance />} />
    <Route path="attendance/:id" element={<EmployeeAttendanceDetails />} />
    <Route path="office-location" element={<OfficeLocationPage />} />
    <Route path="access" element={<AdminAccess />} />
    <Route path="holidays" element={<CompanyHolidays />} />
    <Route path="weekoff" element={<CompanyWeekOff />} />
    <Route path="leave-allocation" element={<LeaveAllocation />} />
    <Route path="support-tickets" element={<AdminSupportTickets />} />
  </Route>
);
