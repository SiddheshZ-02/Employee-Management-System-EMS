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
  Legend,
} from "recharts";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/constant/Config";
import { useAppSelector } from "@/hooks/useAppSelector";

// Types for real data
interface AttendanceRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
    department: string;
  };
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  workMode: "Office" | "WFH";
  status: "checked-in" | "checked-out";
  workingHours?: number;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  status: string;
}

interface MonthlyData {
  month: string;
  attendance: number;
  leaves: number;
  totalDays: number;
  presentCount: number;
}

interface DepartmentData {
  name: string;
  value: number;
  count: number;
  color: string;
}

// Enhanced AttendanceTrendChart with real data
export const AttendanceTrendChart = () => {
  const [attendanceData, setAttendanceData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAppSelector((state) => state.auth);

  const getWorkingDaysInMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }
    return workingDays;
  };

  const processMonthlyAttendance = useCallback((
    attendance: AttendanceRecord[],
    employees: Employee[]
  ): MonthlyData[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    const activeEmployees = employees.filter((emp) => emp.status === "Active");
      
    const totalEmployees = activeEmployees.length;

    return months.map((month, index) => {
      const monthAttendance = attendance.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === currentYear && recordDate.getMonth() === index;
      });

      const presentDays = monthAttendance.filter((record) => record.status === "checked-out").length;
      const workingDays = getWorkingDaysInMonth(currentYear, index);
      const expectedAttendance = totalEmployees * workingDays;

      const attendanceRate = expectedAttendance > 0 ? Math.round((presentDays / expectedAttendance) * 100) : 0;
      const leaveRate = Math.max(0, 100 - attendanceRate);

      return {
        month,
        attendance: attendanceRate,
        leaves: leaveRate,
        totalDays: workingDays,
        presentCount: presentDays,
      };
    });
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        if (!token) return;
        setLoading(true);
        const [attendanceRes, employeeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/attendance?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/employees?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const attendanceJson = await attendanceRes.json();
        const employeeJson = await employeeRes.json();

        const attendance: AttendanceRecord[] = attendanceJson.records || [];
        const employees: Employee[] = (employeeJson.employees || []).map((emp: { _id: string; name: string; department: string; isActive: boolean }) => ({
          id: emp._id,
          name: emp.name,
          department: emp.department,
          status: emp.isActive ? "Active" : "Inactive",
        }));

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
  }, [token, processMonthlyAttendance]);

  if (loading) return <Skeleton className="h-[300px] w-full" />;
  if (error) return <p className="text-destructive p-4">{error}</p>;

  return (
    <Card className="hover-lift transition-smooth border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-sm sm:text-base">Monthly Attendance Trends</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Attendance vs leave patterns throughout the year</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={10} tick={{ fontSize: 10 }} />
            <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
              formatter={(value: number, name: string) => [`${value}%`, name === "attendance" ? "Attendance Rate" : "Leave Rate"]}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
            <Area type="monotone" dataKey="attendance" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAttendance)" strokeWidth={2} name="Attendance" />
            <Area type="monotone" dataKey="leaves" stroke="#ef4444" fillOpacity={1} fill="url(#colorLeaves)" strokeWidth={2} name="Leaves" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Enhanced DepartmentDistributionChart with real data
export const DepartmentDistributionChart = () => {
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return;
        setLoading(true);
        const [empRes, deptRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/employees?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/admin/departments?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const empJson = await empRes.json();
        const deptJson = await deptRes.json();

        const employees = empJson.employees || [];
        const departments = deptJson.departments || [];

        const activeEmployees = employees.filter((emp: { isActive: boolean }) => emp.isActive);
        const totalEmployees = activeEmployees.length;

        const CHART_COLORS = [
          "#f59e0b", // Amber
          "#10b981", // Emerald
          "#3b82f6", // Blue
          "#ef4444", // Red
          "#8b5cf6", // Violet
          "#ec4899", // Pink
          "#06b6d4", // Cyan
          "#f97316", // Orange
          "#84cc16", // Lime
          "#a855f7", // Purple
        ];

        const processed: DepartmentData[] = departments.map((dept: { name: string }, index: number) => {
          const count = activeEmployees.filter((emp: { department: string }) => emp.department === dept.name).length;
          return {
            name: dept.name,
            value: totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0,
            count,
            color: CHART_COLORS[index % CHART_COLORS.length],
          };
        }).filter((d: DepartmentData) => d.count > 0);

        setDepartmentData(processed.sort((a, b) => b.value - a.value));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <Skeleton className="h-[300px] w-full" />;

  return (
    <Card className="hover-lift transition-smooth border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm sm:text-base">Department Distribution</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Employee distribution across departments</CardDescription>
      </CardHeader>
      <CardContent>
        {departmentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={departmentData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="value" labelLine={false}>
                {departmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value: number, name: string, entry: { payload?: DepartmentData }) => {
                if (entry && entry.payload) {
                  return [`${entry.payload.count} employees (${value}%)`, name];
                }
                return [value.toString(), name];
              }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
            <Users className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm font-medium">Department not available</p>
            <p className="text-xs opacity-60">No active employees found in any department</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Real-time Live Stats Card Component
export const LiveStatsCard = () => {
  const [stats, setStats] = useState({ totalEmployees: 0, presentToday: 0, pendingLeaves: 0, currentDay: "", currentDate: "" });
  const [loading, setLoading] = useState(true);
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/admin/statistics`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          const now = new Date();
          setStats({
            totalEmployees: data.today.totalEmployees || 0,
            presentToday: data.today.present || 0,
            pendingLeaves: data.leaves.pending || 0,
            currentDay: now.toLocaleDateString("en-US", { weekday: "long" }),
            currentDate: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 30000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;

  const statCards = [
    { title: "Total Active", value: stats.totalEmployees, icon: Users, color: "bg-blue-500", textColor: "text-blue-600" },
    { title: "Present Today", value: stats.presentToday, icon: TrendingUp, color: "bg-green-500", textColor: "text-green-600" },
    { title: "Pending Leave", value: stats.pendingLeaves, icon: Calendar, color: "bg-orange-500", textColor: "text-orange-600" },
    { title: "Today's Date", value: stats.currentDay, icon: Clock, color: "bg-purple-500", textColor: "text-purple-600" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover-lift transition-smooth border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}/10`}><Icon className={`h-4 w-4 ${stat.textColor}`} /></div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
              {index === 3 && <p className="text-xs text-muted-foreground">{stats.currentDate}</p>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
