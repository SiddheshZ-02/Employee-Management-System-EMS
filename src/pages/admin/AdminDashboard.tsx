import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { Suspense, lazy, useEffect, useState } from "react";
import { LiveStatsCard } from "@/components/ui/charts";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Cake, Calendar as CalendarIcon, Sparkles, Filter } from "lucide-react";
import { format } from "date-fns";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setEmployees } from "@/store/slices/employeeSlice";
import { setDepartments } from "@/store/slices/departmentSlice";
import { setHolidays } from "@/store/slices/holidaySlice";
import { API_BASE_URL } from "@/constant/Config";
import { UpcomingHolidaysWidget } from "@/components/dashboard/UpcomingHolidaysWidget";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AttendanceTrendChartLazy = lazy<
  React.ComponentType<{ department?: string }>
>(() =>
  import("@/components/ui/charts").then((m) => ({
    default: m.AttendanceTrendChart,
  }))
);
const DepartmentDistributionChartLazy = lazy<React.ComponentType<object>>(() =>
  import("@/components/ui/charts").then((m) => ({
    default: m.DepartmentDistributionChart,
  }))
);

const LIGHT_COLORS = [
  "bg-amber-50 border-amber-100 text-amber-700",
  "bg-cyan-50 border-cyan-100 text-cyan-700",
  "bg-indigo-50 border-indigo-100 text-indigo-700",
  "bg-purple-50 border-purple-100 text-purple-700",
  "bg-emerald-50 border-emerald-100 text-emerald-700",
  "bg-rose-50 border-rose-100 text-rose-700",
  "bg-blue-50 border-blue-100 text-blue-700",
];

const getPastelColor = (index: number) =>
  LIGHT_COLORS[index % LIGHT_COLORS.length];

interface BackendEmployee {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  position?: string;
  department?: string;
  createdAt?: string;
  isActive?: boolean;
  dateOfBirth?: string;
}

interface BackendDepartment {
  _id: string;
  name: string;
  description: string;
  manager: string;
  employeeCount?: number;
  status?: string;
}

export const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { departments } = useAppSelector((state) => state.departments);
  const { employees } = useAppSelector((state) => state.employees);
  const { user, token } = useAppSelector((state) => state.auth);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<
    {
      id: string;
      name: string;
      department: string;
      birthdayDate: string;
      daysUntil: number;
    }[]
  >([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  useEffect(() => {
    if (!token) {
      return;
    }
    const fetchData = async () => {
      try {
        const [employeesRes, departmentsRes, holidaysRes, birthdaysRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/api/auth/colleagues`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/admin/departments?page=1&limit=100`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/holidays`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/auth/birthdays`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (employeesRes.ok) {
          const employeesJson = await employeesRes.json();
          if (employeesJson.success && Array.isArray(employeesJson.employees)) {
            const mappedEmployees = employeesJson.employees.map(
              (emp: BackendEmployee) => ({
                id: String(emp._id),
                name: String(emp.name),
                email: String(emp.email),
                employeeId: String(emp.employeeId || ""),
                position: String(emp.position || emp.employeeId || ""),
                department: String(emp.department || ""),
                joinDate: emp.createdAt
                  ? new Date(emp.createdAt).toISOString()
                  : new Date().toISOString(),
                status: emp.isActive === false ? "Inactive" : "Active",
                dateOfBirth: emp.dateOfBirth,
              })
            );
            dispatch(setEmployees(mappedEmployees));
          }
        }

        if (birthdaysRes.ok) {
          const birthdaysJson = await birthdaysRes.json();
          if (birthdaysJson.success && Array.isArray(birthdaysJson.birthdays)) {
            setUpcomingBirthdays(birthdaysJson.birthdays);
          }
        }

        if (departmentsRes.ok) {
          const departmentsJson = await departmentsRes.json();
          if (
            departmentsJson.success &&
            Array.isArray(departmentsJson.departments)
          ) {
            const mappedDepartments = departmentsJson.departments.map(
              (dept: BackendDepartment) => ({
                id: String(dept._id),
                name: String(dept.name),
                description: String(dept.description),
                manager: String(dept.manager),
                employeeCount:
                  typeof dept.employeeCount === "number"
                    ? dept.employeeCount
                    : 0,
                status: dept.status === "Inactive" ? "Inactive" : "Active",
              })
            );
            dispatch(setDepartments(mappedDepartments));
          }
        }

        if (holidaysRes.ok) {
          const holidaysJson = await holidaysRes.json();
          if (holidaysJson.success && Array.isArray(holidaysJson.holidays)) {
            dispatch(setHolidays(holidaysJson.holidays));
          }
        }
      } catch {
        return;
      }
    };
    fetchData();
  }, [dispatch, token]);

  // const activeEmployees = employees.filter(
  //   (emp) => emp.status === "Active"
  // ).length;
  // const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 animate-fade-in w-full">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-in-left">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold  bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Welcome back, {user?.name}! 👋
              </h2>
              <p className="text-muted-foreground mt-2">
                Here's an overview of your organization's current status.
              </p>
            </div>
          </div>

          {/* Live Stats Grid */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <LiveStatsCard />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
            <UpcomingHolidaysWidget />

            <Card className="hover-lift transition-smooth border-0 shadow-lg overflow-hidden bg-gradient-to-br from-card to-card/95 flex flex-col h-[380px]">
              <CardHeader className="pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-4 rounded-full bg-pink-500/10">
                      <Cake className="h-6 w-6 text-pink-600" />
                    </div>
                    <span>Upcoming Birthdays</span>
                  </CardTitle>
                  {upcomingBirthdays.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="font-medium bg-pink-500/5 text-pink-600 border-pink-500/10"
                    >
                      {upcomingBirthdays.length} events
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Birthdays within the next 10 days
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 overflow-y-auto scrollbar-hide flex-1">
                {upcomingBirthdays.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBirthdays.map((emp, index) => {
                      const colorClasses = getPastelColor(index);
                      const isToday = emp.daysUntil === 0;

                      return (
                        <div
                          key={emp.id}
                          className={`group relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${colorClasses} animate-fade-in`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex flex-col items-center justify-center min-w-[50px] h-[54px] rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border-white/50 group-hover:bg-white transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                              {format(emp.birthdayDate!, "MMM")}
                            </span>
                            <span className="text-xl font-bold tracking-tight">
                              {format(emp.birthdayDate!, "dd")}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold truncate">
                                {emp.name}
                              </h4>
                              {isToday && (
                                <Badge className="bg-pink-500 hover:bg-pink-600 text-[10px] h-4 px-1.5 animate-pulse">
                                  TODAY
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center text-[11px] font-medium opacity-70">
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              {emp.department}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[10px] font-bold bg-white/40 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                              {emp.daysUntil === 0
                                ? "Today! 🎂"
                                : emp.daysUntil === 1
                                ? "Tomorrow"
                                : `In ${emp.daysUntil} days`}
                            </span>
                          </div>

                          {isToday && (
                            <div className="absolute -top-1 -right-1">
                              <Sparkles className="h-4 w-4 text-pink-500 animate-bounce" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 bg-pink-500/5 rounded-xl border border-dashed border-pink-500/20 h-full">
                    <div className="p-3 rounded-full bg-pink-500/10">
                      <Cake className="h-6 w-6 text-pink-500/40" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-pink-500/80">
                        {employees.length === 0
                          ? "No colleagues found"
                          : "No upcoming birthdays"}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                        {employees.length === 0
                          ? "We couldn't find any team members in your organization."
                          : "There are no birthdays scheduled for the next 10 days."}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  Real-time Analytics & Insights
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Live data from your organization's attendance and department
                  systems
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
              <div className="w-full min-w-0">
                <Suspense
                  fallback={
                    <div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />
                  }
                >
                  <AttendanceTrendChartLazy
                    department={
                      selectedDepartment === "all"
                        ? undefined
                        : selectedDepartment
                    }
                  />
                </Suspense>
              </div>
              <div className="w-full min-w-0">
                <Suspense
                  fallback={
                    <div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />
                  }
                >
                  <DepartmentDistributionChartLazy />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
