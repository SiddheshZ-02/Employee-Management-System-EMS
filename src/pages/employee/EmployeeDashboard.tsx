import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setHolidays } from "@/store/slices/holidaySlice";
import { Clock, Calendar, User, CheckCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/constant/Config";
import { UpcomingHolidaysWidget } from "@/components/dashboard/UpcomingHolidaysWidget";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

export const EmployeeDashboard = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [hoursToday, setHoursToday] = useState("0h 0m");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [monthAttendance, setMonthAttendance] = useState<{
    attended: number;
    totalDays: number;
  }>({
    attended: 0,
    totalDays: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [holidays, setHolidaysState] = useState<any[]>([]);

  useEffect(() => {
    if (!token) {
      return;
    }
    const loadData = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;

        const [todayRes, historyRes, leaveRes, balanceRes, activityRes, holidayRes] = await Promise.all(
          [
            fetch(`${API_BASE_URL}/api/attendance/today`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/attendance/history?period=month`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/leave/my-requests`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }),
            fetch(`${API_BASE_URL}/api/leave/balances`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/activity/today?date=${todayStr}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/holidays`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]
        );

        let currentWeekRecords = [];
        let currentLeaves = [];
        let currentHolidays = [];

        if (todayRes.ok) {
          const todayJson = await todayRes.json();
          if (todayJson.success) {
            if (todayJson.stats && todayJson.stats.totalHours) {
              setHoursToday(todayJson.stats.totalHours);
            } else {
              setHoursToday("0h 0m");
            }
            setIsCheckedIn(todayJson.hasCheckedIn && !todayJson.hasCheckedOut);
          }
        }

        if (historyRes.ok) {
          const historyJson = await historyRes.json();
          if (historyJson.success && historyJson.statistics) {
            const attended = historyJson.statistics.totalDays || 0;
            const now = new Date();
            const start = startOfMonth(now);
            const end = endOfMonth(now);
            const totalDays = differenceInDays(end, start) + 1;
            setMonthAttendance({ attended, totalDays });
            currentWeekRecords = historyJson.records || [];
          }
        }

        if (leaveRes.ok) {
          const leaveJson = await leaveRes.json();
          if (leaveJson.success && Array.isArray(leaveJson.leaveRequests)) {
            currentLeaves = leaveJson.leaveRequests;
            setLeaves(leaveJson.leaveRequests);
          }
        }

        if (holidayRes.ok) {
          const holidayJson = await holidayRes.json();
          if (holidayJson.success && holidayJson.holidays) {
            currentHolidays = holidayJson.holidays;
            setHolidaysState(holidayJson.holidays);
            dispatch(setHolidays(holidayJson.holidays));
          }
        }

        // Now calculate weekly data with all available information
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const weeklyStats = daysInWeek.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const record = currentWeekRecords.find((r: any) => r.date === dayStr);
          const hours = record ? parseFloat((record.workingHours || 0).toFixed(1)) : 0;
          
          // Determine status
          let status = "none";
          const isHoliday = currentHolidays.some((h: any) => h.date === dayStr);
          const isLeave = currentLeaves.some((l: any) => 
            l.status === "approved" && 
            dayStr >= format(parseISO(l.startDate), "yyyy-MM-dd") && 
            dayStr <= format(parseISO(l.endDate), "yyyy-MM-dd")
          );
          const isWeekOff = day.getDay() === 0 || day.getDay() === 6; // Sun = 0, Sat = 6

          if (hours > 0) {
            status = "present";
          } else if (isHoliday) {
            status = "holiday";
          } else if (isLeave) {
            status = "leave";
          } else if (isWeekOff) {
            status = "weekoff";
          } else if (day < now && !isSameDay(day, now)) {
            status = "absent";
          }

          return {
            day: format(day, "EEE"),
            fullDate: format(day, "MMMM do"),
            hours: hours,
            displayHours: hours,
            isToday: isSameDay(day, now),
            status: status,
          };
        });
        setWeeklyData(weeklyStats);

        if (balanceRes.ok) {
          const balanceJson = await balanceRes.json();
          if (balanceJson.success && Array.isArray(balanceJson.balances)) {
            const totalRemaining = balanceJson.balances.reduce(
              (sum: number, b: any) => sum + (b.remainingDays || 0),
              0
            );
            setLeaveBalance(totalRemaining);
          }
        }

        if (activityRes.ok) {
          const activityJson = await activityRes.json();
          if (activityJson.success && activityJson.activities) {
            setActivities(activityJson.activities);
          }
        }
      } catch {
        return;
      } finally {
        setIsLoadingActivities(false);
      }
    };
    loadData();
  }, [token, dispatch]);

  // Periodic update for "Hours Today" while checked in
  useEffect(() => {
    if (!token || !isCheckedIn) return;

    const interval = setInterval(async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;

        const [todayRes, historyRes, activityRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/attendance/today`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/attendance/history?period=month`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/activity/today?date=${todayStr}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (todayRes.ok) {
          const data = await todayRes.json();
          if (data.success && data.stats && data.stats.totalHours) {
            setHoursToday(data.stats.totalHours);
            setIsCheckedIn(data.hasCheckedIn && !data.hasCheckedOut);
          }
        }

        if (historyRes.ok) {
          const historyJson = await historyRes.json();
          if (historyJson.success && historyJson.records) {
            const now = new Date();
            const weekStart = startOfWeek(now, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
            const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
            const weekRecords = historyJson.records || [];
            
            const weeklyStats = daysInWeek.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const record = weekRecords.find((r: any) => r.date === dayStr);
              const hours = record ? parseFloat((record.workingHours || 0).toFixed(1)) : 0;
              
              // Determine status
              let status = "none";
              const isHoliday = holidays.some((h: any) => h.date === dayStr);
              const isLeave = leaves.some((l: any) => 
                l.status === "approved" && 
                dayStr >= format(parseISO(l.startDate), "yyyy-MM-dd") && 
                dayStr <= format(parseISO(l.endDate), "yyyy-MM-dd")
              );
              const isWeekOff = day.getDay() === 0 || day.getDay() === 6; // Sun = 0, Sat = 6

              if (hours > 0) {
                status = "present";
              } else if (isHoliday) {
                status = "holiday";
              } else if (isLeave) {
                status = "leave";
              } else if (isWeekOff) {
                status = "weekoff";
              } else if (day < now && !isSameDay(day, now)) {
                status = "absent";
              }

              return {
                day: format(day, "EEE"),
                fullDate: format(day, "MMMM do"),
                hours: hours,
                displayHours: hours,
                isToday: isSameDay(day, now),
                status: status,
              };
            });
            setWeeklyData(weeklyStats);
          }
        }

        if (activityRes.ok) {
          const activityJson = await activityRes.json();
          if (activityJson.success && activityJson.activities) {
            setActivities(activityJson.activities);
          }
        }
      } catch (err) {
        console.error("Failed to refresh dashboard data", err);
      }
    }, 60000); // refresh every minute

    return () => clearInterval(interval);
  }, [token, isCheckedIn, holidays, leaves]);

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 animate-fade-in w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-in-left">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Welcome, {user?.name}! 👋
              </h2>
              <p className="text-muted-foreground mt-2">
                Here's your daily overview and quick actions
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div
              className="animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <Card className="hover-lift transition-smooth border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Hours Today
                  </CardTitle>
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {hoursToday}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                    <span className="truncate">Normal schedule</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            <div
              className="animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <Card className="hover-lift transition-smooth border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Leave Balance
                  </CardTitle>
                  <div className="p-2 rounded-full bg-green-500/10">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {leaveBalance}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                    <span className="truncate">Days remaining</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            <div
              className="animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <Card className="hover-lift transition-smooth border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    This Month
                  </CardTitle>
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {monthAttendance.attended}/{monthAttendance.totalDays}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                    <span className="truncate">Days attended</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            <div
              className="animate-fade-in"
              style={{ animationDelay: "400ms" }}
            >
              <Card className="hover-lift transition-smooth border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Performance
                  </CardTitle>
                  <div className="p-2 rounded-full bg-orange-500/10">
                    <User className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">A+</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                    <span className="truncate">Current rating</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <UpcomingHolidaysWidget />

            <Card className="hover-lift transition-smooth border-0 shadow-lg overflow-hidden flex flex-col h-[380px]">
              <CardHeader className="shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="truncate">Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Your recent actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-y-auto scrollbar-hide flex-1">
                <div className="space-y-4">
                  {isLoadingActivities ? (
                    <div className="flex flex-col space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-16 rounded-lg bg-muted animate-pulse"
                        />
                      ))}
                    </div>
                  ) : activities.length > 0 ? (
                    activities.map((activity) => (
                      <div
                        key={activity._id}
                        className={`flex items-center space-x-4 p-3 rounded-lg border transition-all hover:shadow-sm ${
                          activity.type === "check-in"
                            ? "bg-green-500/5 border-green-500/20"
                            : activity.type === "check-out"
                            ? "bg-blue-500/5 border-blue-500/20"
                            : activity.type === "leave-approved"
                            ? "bg-purple-500/5 border-purple-500/20"
                            : "bg-orange-500/5 border-orange-500/20"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-full shrink-0 ${
                            activity.type === "check-in"
                              ? "bg-green-500/10"
                              : activity.type === "check-out"
                              ? "bg-blue-500/10"
                              : activity.type === "leave-approved"
                              ? "bg-purple-500/10"
                              : "bg-orange-500/10"
                          }`}
                        >
                          {activity.type === "check-in" && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {activity.type === "check-out" && (
                            <Clock className="h-5 w-5 text-blue-600" />
                          )}
                          {activity.type === "leave-approved" && (
                            <Calendar className="h-5 w-5 text-purple-600" />
                          )}
                          {activity.type === "profile-update" && (
                            <User className="h-5 w-5 text-orange-600" />
                          )}
                          {activity.type === "document-upload" && (
                            <User className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                      <div className="p-3 rounded-full bg-muted/50">
                        <CheckCircle className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        No recent activity
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Your activities for today will appear here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-smooth border-0 shadow-lg overflow-hidden lg:col-span-2 flex flex-col">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Weekly Attendance</span>
                  </CardTitle>
                  <CardDescription>
                    Working hours for the current week
                  </CardDescription>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-2xl font-bold text-primary">
                    {weeklyData.reduce((sum, d) => sum + (d.status === 'present' ? d.hours : 0), 0).toFixed(1)}h
                  </div>
                  <div className="text-xs text-muted-foreground">Total this week</div>
                </div>
              </CardHeader>
              <CardContent className="h-[280px] mt-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#888", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#888", fontSize: 12 }}
                      unit="h"
                      domain={[0, 24]}
                      ticks={[0, 4, 8, 12, 16, 20, 24]}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const getStatusColor = (status: string) => {
                            switch (status) {
                              case "present": return "bg-green-500";
                              case "leave": return "bg-orange-500";
                              case "holiday": return "bg-blue-500";
                              case "absent": return "bg-red-500";
                              case "weekoff": return "bg-yellow-500";
                              default: return "bg-slate-300";
                            }
                          };
                          const getStatusText = (status: string) => {
                            switch (status) {
                              case "present": return "Present";
                              case "leave": return "On Leave";
                              case "holiday": return "Holiday";
                              case "absent": return "Absent";
                              case "weekoff": return "Week Off";
                              default: return "No Data";
                            }
                          };
                          return (
                            <div className="bg-white p-3 shadow-xl rounded-lg border border-slate-100 animate-in fade-in zoom-in duration-200">
                              <p className="text-xs font-semibold text-slate-500 mb-1">{data.fullDate}</p>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(data.status)}`} />
                                <p className="text-sm font-bold text-slate-900">{getStatusText(data.status)}</p>
                              </div>
                              {data.status === "present" && (
                                <p className="text-xs text-slate-500 mt-1">{data.displayHours} Working Hours</p>
                              )}
                              {data.isToday && <p className="text-[10px] text-purple-600 font-medium mt-1">Today</p>}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={50} minPointSize={6}>
                      {weeklyData.map((entry, index) => {
                        let fill = "#f1f5f9";
                        
                        switch (entry.status) {
                          case "present":
                            fill = "#22c55e";
                            break;
                          case "leave":
                            fill = "#f97316";
                            break;
                          case "holiday":
                            fill = "#3b82f6";
                            break;
                          case "absent":
                            fill = "#ef4444";
                            break;
                          case "weekoff":
                            fill = "#eab308";
                            break;
                        }

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={fill}
                            stroke={fill}
                            strokeWidth={entry.isToday ? 2 : 0}
                            fillOpacity={1}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
              <div className="px-6 pb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                  <span>Leave</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  <span>Holiday</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />
                  <span>Week Off</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
