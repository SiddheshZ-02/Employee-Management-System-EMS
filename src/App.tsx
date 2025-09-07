import { Provider } from "react-redux";
import { store } from "@/store";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Auth } from "@/pages/Auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { EmployeeManagement } from "@/pages/admin/EmployeeManagement";
import { DepartmentManagement } from "@/pages/admin/DepartmentManagement";
import { UserManagement } from "@/pages/admin/UserManagement";
import { EmployeeDashboard } from "@/pages/employee/EmployeeDashboard";
import AttendanceTracking from "@/pages/employee/AttendanceTracking";
import LeaveManagement from "@/pages/employee/LeaveManagement";
import { ProfileManagement } from "@/pages/employee/ProfileManagement";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/auth" replace />} />

            {/* Admin Routes */}
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
              <Route path="departments" element={<DepartmentManagement />} />
              <Route path="users" element={<UserManagement />} />
            </Route>

            {/* Employee Routes */}
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
              <Route path="profile" element={<ProfileManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
