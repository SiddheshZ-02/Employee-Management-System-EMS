import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AttendanceTrendChart,
  DepartmentDistributionChart,
  WeeklyAttendanceChart,
  LiveStatsCard,
} from "@/components/ui/charts";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  Users,
  Building2,
  TrendingUp,
  UserCheck,
  Calendar,
} from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setEmployees } from "@/store/slices/employeeSlice";
import { setDepartments } from "@/store/slices/departmentSlice";
import { BASE_URL } from "@/constant/Config";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) => (
  <Card className="hover-lift transition-smooth border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">
        {title}
      </CardTitle>
      <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 shrink-0">
        <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="text-xl sm:text-2xl font-bold text-foreground animate-fade-in truncate">
        {value}
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
        {trend && (
          <span className="text-green-600 font-medium flex items-center gap-1 shrink-0">
            <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">{trend}</span>
          </span>
        )}
        <span className="truncate">{description}</span>
      </p>
    </CardContent>
  </Card>
);

export const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { employees } = useAppSelector((state) => state.employees);
  const { departments } = useAppSelector((state) => state.departments);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Fetch employees
    fetch(BASE_URL + `/employees`)
      .then((res) => res.json())
      .then((data) => dispatch(setEmployees(data)));
    // Fetch departments
    fetch(BASE_URL + `/departments`)
      .then((res) => res.json())
      .then((data) => dispatch(setDepartments(data)));
  }, [dispatch]);

  const activeEmployees = employees.filter(
    (emp) => emp.status === "Active"
  ).length;
  // const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 animate-fade-in w-full">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-in-left">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Welcome back, {user?.name}! 👋
              </h2>
              <p className="text-muted-foreground mt-2">
                Here's an overview of your organization's current status.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <Calendar className="h-4 w-4" />
              <span className="hidden lg:inline">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="lg:hidden">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Live Stats Grid */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <LiveStatsCard />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="hover-lift transition-smooth border-0 shadow-lg overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                  <div className="p-1 sm:p-1.5 md:p-2 rounded-full bg-blue-500/10 shrink-0">
                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <span className="truncate text-xs sm:text-sm md:text-base">
                    Recent Employee Activity
                  </span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm hidden sm:block">
                  Latest employee registrations and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-6">
                <div className="space-y-2 sm:space-y-3">
                  {employees.slice(0, 3).map((employee, index) => (
                    <div
                      key={employee.id}
                      className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-medium text-xs shrink-0">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium leading-tight truncate">
                          {employee.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          <span className="hidden md:inline">
                            {employee.position} •{" "}
                          </span>
                          <span className="md:hidden">
                            {employee.position.length > 15
                              ? employee.position.substring(0, 15) + "..."
                              : employee.position}
                          </span>
                          <span className="hidden md:inline">
                            {employee.department}
                          </span>
                          <span className="md:hidden">
                            {" "}
                            •{" "}
                            {employee.department.length > 10
                              ? employee.department.substring(0, 10) + "..."
                              : employee.department}
                          </span>
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground shrink-0">
                        {employee.status === "Active" ? (
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium text-green-600 border border-green-500/20">
                            <span className="hidden sm:inline">● </span>Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium text-gray-600 border border-gray-500/20">
                            <span className="hidden sm:inline">● </span>Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-smooth border-0 shadow-lg overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                  <div className="p-1 sm:p-1.5 md:p-2 rounded-full bg-purple-500/10 shrink-0">
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-600" />
                  </div>
                  <span className="truncate text-xs sm:text-sm md:text-base">
                    Department Overview
                  </span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm hidden sm:block">
                  Current department statistics and management
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-6">
                <div className="space-y-2 sm:space-y-3">
                  {departments.slice(0, 3).map((dept, index) => (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-primary shrink-0"></div>
                          <span className="truncate">
                            {dept.name.length > 20
                              ? dept.name.substring(0, 20) + "..."
                              : dept.name}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {dept.employeeCount} emp
                          <span className="hidden sm:inline">loyees</span>
                          <span className="hidden md:inline">
                            {" "}
                            •{" "}
                            {dept.manager.length > 15
                              ? dept.manager.substring(0, 15) + "..."
                              : dept.manager}
                          </span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium text-primary border border-primary/20">
                          {dept.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                Real-time Analytics & Insights
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Live data from your organization's attendance and department
                systems
              </p>
            </div>

            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 xl:grid-cols-2">
              <div className="w-full min-w-0">
                <AttendanceTrendChart />
              </div>
              <div className="w-full min-w-0">
                <DepartmentDistributionChart />
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 md:gap-6">
              <div className="w-full min-w-0">
                <WeeklyAttendanceChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
