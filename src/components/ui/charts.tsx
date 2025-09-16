import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BASE_URL } from "@/constant/Config";

// Types for real data
interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  time_in: string;
  time_out: string;
  workinghours: number;
  workingminutes?: number;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  status: string;
}

interface Department {
  id: string;
  name: string;
  status: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
}

// Enhanced AttendanceTrendChart with real data
export const AttendanceTrendChart = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const [attendanceRes, employeeRes] = await Promise.all([
          fetch(BASE_URL + `/attendance`),
          fetch(BASE_URL + `/employees`),
        ]);

        const attendance: AttendanceRecord[] = await attendanceRes.json();
        const employees: Employee[] = await employeeRes.json();

        // Process data for monthly trends
        const monthlyData = processMonthlyAttendance(attendance, employees);
        setAttendanceData(monthlyData);
      } catch (err) {
        setError("Failed to load attendance data");
        console.error("Error fetching attendance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const processMonthlyAttendance = (
    attendance: AttendanceRecord[],
    employees: Employee[]
  ) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentYear = new Date().getFullYear();
    const activeEmployees = employees.filter((emp) => emp.status === "Active");
    const totalEmployees = activeEmployees.length;

    return months.map((month, index) => {
      const monthAttendance = attendance.filter((record) => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getFullYear() === currentYear &&
          recordDate.getMonth() === index
        );
      });

      const presentDays = monthAttendance.filter(
        (record) => record.time_out
      ).length;
      const workingDays = getWorkingDaysInMonth(currentYear, index);
      const expectedAttendance = totalEmployees * workingDays;

      const attendanceRate =
        expectedAttendance > 0
          ? Math.round((presentDays / expectedAttendance) * 100)
          : 0;
      const leaveRate = Math.max(0, 100 - attendanceRate);

      return {
        month,
        attendance: attendanceRate,
        leaves: leaveRate,
        totalDays: workingDays,
        presentCount: presentDays,
      };
    });
  };

  const getWorkingDaysInMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      // Exclude weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    return workingDays;
  };

  if (loading) {
    return (
      <Card className="hover-lift transition-smooth border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="hover-lift transition-smooth border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-lift transition-smooth border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-sm sm:text-base">
            Monthly Attendance Trends
          </span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Attendance vs leave patterns throughout the year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={attendanceData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorAttendance"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={10}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tick={{ fontSize: 10 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === "attendance" ? "Attendance Rate" : "Leave Rate",
                ]}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
              <Area
                type="monotone"
                dataKey="attendance"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorAttendance)"
                strokeWidth={2}
                name="Attendance"
              />
              <Area
                type="monotone"
                dataKey="leaves"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorLeaves)"
                strokeWidth={2}
                name="Leaves"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced DepartmentDistributionChart with real data
export const DepartmentDistributionChart = () => {
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const departmentColors = {
    Engineering: "#3b82f6",
    Sales: "#10b981",
    Marketing: "#f59e0b",
    HR: "#ef4444",
    Finance: "#8b5cf6",
    Product: "#06b6d4",
    Operations: "#84cc16",
    Support: "#f97316",
    default: "#6b7280",
  };

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setLoading(true);
        const [employeeRes, departmentRes] = await Promise.all([
          fetch(BASE_URL + `/employees`),
          fetch(BASE_URL + `/departments`),
        ]);

        const employees: Employee[] = await employeeRes.json();
        const departments: Department[] = await departmentRes.json();

        const processedData = processDepartmentDistribution(
          employees,
          departments
        );
        setDepartmentData(processedData);
      } catch (err) {
        setError("Failed to load department data");
        console.error("Error fetching department data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, []);

  const processDepartmentDistribution = (
    employees: Employee[],
    departments: Department[]
  ) => {
    const activeEmployees = employees.filter((emp) => emp.status === "Active");
    const totalEmployees = activeEmployees.length;

    if (totalEmployees === 0) return [];

    const departmentCounts = departments
      .map((dept) => {
        const deptEmployees = activeEmployees.filter(
          (emp) => emp.department === dept.name
        );
        const percentage = Math.round(
          (deptEmployees.length / totalEmployees) * 100
        );

        return {
          name: dept.name,
          value: percentage,
          count: deptEmployees.length,
          color:
            departmentColors[dept.name as keyof typeof departmentColors] ||
            departmentColors.default,
        };
      })
      .filter((dept) => dept.count > 0);

    return departmentCounts.sort((a, b) => b.value - a.value);
  };

  if (loading) {
    return (
      <Card className="hover-lift transition-smooth border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-5 w-40" />
          </CardTitle>
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="hover-lift transition-smooth border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-lift transition-smooth border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm sm:text-base">Department Distribution</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Employee distribution across active departments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                // label={(props: any) => `${props.name}: ${props.value}%`}
                labelLine={false}
                fontSize={10}
              >
                {departmentData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string, entry: any) => [
                  `${entry.payload.count} employees (${value}%)`,
                  name,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced WeeklyAttendanceChart with real data
export const WeeklyAttendanceChart = () => {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setLoading(true);
        const [attendanceRes, employeeRes] = await Promise.all([
          fetch(BASE_URL + `/attendance`),
          fetch(BASE_URL + `/employees`),
        ]);

        const attendance: AttendanceRecord[] = await attendanceRes.json();
        const employees: Employee[] = await employeeRes.json();

        const processedData = processWeeklyAttendance(attendance, employees);
        setWeeklyData(processedData);
      } catch (err) {
        setError("Failed to load weekly data");
        console.error("Error fetching weekly data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, []);

  const processWeeklyAttendance = (
    attendance: AttendanceRecord[],
    employees: Employee[]
  ) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const activeEmployees = employees.filter((emp) => emp.status === "Active");
    const totalEmployees = activeEmployees.length;

    // Get current week dates
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    return days.map((dayName, index) => {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + index);
      const dateString = currentDate.toISOString().split("T")[0];

      const dayAttendance = attendance.filter(
        (record) => record.date === dateString && record.time_out // Only count completed attendance
      );

      const present = dayAttendance.length;
      const absent = Math.max(0, totalEmployees - present);

      return {
        day: dayName,
        present,
        absent,
        total: totalEmployees,
        date: currentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    });
  };

  if (loading) {
    return (
      <Card className="hover-lift transition-smooth border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="hover-lift transition-smooth border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-lift transition-smooth border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
          <span className="text-sm sm:text-base">Weekly Attendance</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Current week attendance overview (Monday to Friday)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="w-full overflow-hidden">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={weeklyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                fontSize={10}
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tick={{ fontSize: 10 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value} employees`,
                  name === "present" ? "Present" : "Absent",
                ]}
                labelFormatter={(label: string, payload: any) =>
                  payload[0] ? `${label} (${payload[0].payload.date})` : label
                }
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} iconType="rect" />
              <Bar
                dataKey="present"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Present"
              />
              <Bar
                dataKey="absent"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Absent"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Real-time Live Stats Card Component
export const LiveStatsCard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    averageHours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const [employeeRes, attendanceRes, leaveRes] = await Promise.all([
          fetch(BASE_URL + `/employees`),
          fetch(BASE_URL + `/attendance`),
          fetch(BASE_URL + `/leaves`),
        ]);

        const employees: Employee[] = await employeeRes.json();
        const attendance: AttendanceRecord[] = await attendanceRes.json();
        const leaves: LeaveRequest[] = await leaveRes.json();

        const today = new Date().toISOString().split("T")[0];
        const activeEmployees = employees.filter(
          (emp) => emp.status === "Active"
        );

        const todayAttendance = attendance.filter(
          (record) => record.date === today && record.time_in
        );

        const activeLeavesToday = leaves.filter((leave) => {
          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);
          const todayDate = new Date(today);
          return (
            leave.status === "Approved" &&
            todayDate >= startDate &&
            todayDate <= endDate
          );
        });

        // Calculate average working hours from completed attendance
        const completedAttendance = attendance.filter(
          (record) => record.time_out && record.workinghours > 0
        );
        const avgHours =
          completedAttendance.length > 0
            ? Math.round(
                (completedAttendance.reduce(
                  (sum, record) =>
                    sum +
                    record.workinghours +
                    (record.workingminutes || 0) / 60,
                  0
                ) /
                  completedAttendance.length) *
                  10
              ) / 10
            : 0;

        setStats({
          totalEmployees: activeEmployees.length,
          presentToday: todayAttendance.length,
          onLeave: activeLeavesToday.length,
          averageHours: avgHours,
        });
      } catch (error) {
        console.error("Error fetching live stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="hover-lift transition-smooth border-0 shadow-lg"
          >
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Active",
      value: stats.totalEmployees,
      suffix: "employees",
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Present Today",
      value: stats.presentToday,
      suffix: "checked in",
      icon: TrendingUp,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "On Leave",
      value: stats.onLeave,
      suffix: "employees",
      icon: Calendar,
      color: "bg-orange-500",
      textColor: "text-orange-600",
    },
    {
      title: "Avg. Hours",
      value: stats.averageHours,
      suffix: "per day",
      icon: BarChart3,
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const attendanceRate =
          stats.totalEmployees > 0
            ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
            : 0;

        return (
          <Card
            key={index}
            className="hover-lift transition-smooth border-0 shadow-lg bg-gradient-to-br from-card to-card/80"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.color}/10`}>
                <Icon className={`h-4 w-4 ${stat.textColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${stat.textColor} animate-fade-in`}
              >
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {index === 1 && (
                  <span
                    className={`w-2 h-2 rounded-full ${stat.color} shrink-0 animate-pulse`}
                  ></span>
                )}
                <span className="truncate">
                  {stat.suffix}
                  {index === 1 && ` (${attendanceRate}% rate)`}
                </span>
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
