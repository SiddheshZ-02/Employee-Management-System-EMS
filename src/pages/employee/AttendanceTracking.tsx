import { useEffect, useState, useCallback } from "react";
import { Clock, Calendar, CheckCircle, XCircle, Timer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import {
  clockIn,
  clockOut,
  loadTodayRecord,
} from "@/store/slices/attendanceSlice";
import type { AttendanceRecord } from "@/store/slices/attendanceSlice";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BASE_URL } from "@/constant/Config";

const AttendanceTracking = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { todayRecord } = useAppSelector((state) => state.attendance);
  const dispatch = useAppDispatch();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveWorkingTime, setLiveWorkingTime] = useState<string>("");
  const [dailyRefreshCheck, setDailyRefreshCheck] = useState<string>("");

  // Enhanced time calculation function
  const calculateWorkingTime = useCallback((timeIn: string, timeOut?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const clockInTime = new Date(`${today}T${timeIn}`);
      const clockOutTime = timeOut ? new Date(`${today}T${timeOut}`) : new Date();
      
      // Handle cases where checkout is next day
      if (clockOutTime < clockInTime) {
        clockOutTime.setDate(clockOutTime.getDate() + 1);
      }
      
      const diffMs = clockOutTime.getTime() - clockInTime.getTime();
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const workinghours = Math.floor(totalMinutes / 60);
      const workingminutes = totalMinutes % 60;
      
      return { workinghours, workingminutes, totalMinutes };
    } catch (error) {
      console.error('Error calculating working time:', error);
      return { workinghours: 0, workingminutes: 0, totalMinutes: 0 };
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      dispatch(loadTodayRecord({ employeeId: user.id }));
    }
  }, [user?.id, dispatch]);

  const handleClockIn = async () => {
    if (user?.id) {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const time_in = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      
      try {
        const response = await fetch( BASE_URL +`/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_id: user.id,
            date: today,
            time_in,
            time_out: "",
            workinghours: 0,
            workingminutes: 0,
            checkin_timestamp: now.toISOString(),
          }),
        });
        const record = await response.json();
        if (response.ok) {
          dispatch(clockIn({ record }));
          toast.success(`Clocked in successfully at ${time_in}!`);
          fetchAttendance();
        } else {
          toast.error("Failed to clock in.");
        }
      } catch (error) {
        toast.error("Error clocking in.");
      }
    }
  };

  const handleClockOut = async () => {
    if (user?.id && todayRecord?.time_in && !todayRecord?.time_out) {
      if (!todayRecord.id) {
        toast.error("No valid attendance record found for today.");
        return;
      }
      
      const now = new Date();
      const time_out = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      
      const { workinghours, workingminutes } = calculateWorkingTime(todayRecord.time_in, time_out);
      
      try {
        const response = await fetch(
           BASE_URL +` /attendance/${todayRecord.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...todayRecord,
              time_out,
              workinghours,
              workingminutes,
              checkout_timestamp: now.toISOString(),
            }),
          }
        );
        const record = await response.json();
        if (response.ok) {
          dispatch(clockOut({ record }));
          toast.success(`Clocked out successfully at ${time_out}! Total working time: ${workinghours}h ${workingminutes}m`);
          fetchAttendance();
          dispatch(loadTodayRecord({ employeeId: user.id }));
        } else {
          toast.error("Failed to clock out: " + (record?.message || JSON.stringify(record)));
        }
      } catch (error) {
        toast.error("Error clocking out: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(BASE_URL + `/attendance`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      setAttendance(res);
    } catch (error) {
      console.log("Error fetching attendance data:", error);
    }
  };

  // Real-time clock and live working time calculation
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Calculate live working time if checked in
      if (todayRecord?.time_in && !todayRecord?.time_out) {
        const { workinghours, workingminutes } = calculateWorkingTime(todayRecord.time_in);
        setLiveWorkingTime(`${workinghours}h ${workingminutes}m`);
      } else {
        setLiveWorkingTime("");
      }
      
      // Check for daily refresh (at midnight)
      const currentDate = now.toISOString().split('T')[0];
      if (dailyRefreshCheck && dailyRefreshCheck !== currentDate) {
        // New day detected, refresh attendance data
        if (user?.id) {
          dispatch(loadTodayRecord({ employeeId: user.id }));
          fetchAttendance();
          toast.success("New day detected! Attendance data refreshed.");
        }
      }
      setDailyRefreshCheck(currentDate);
    }, 1000);

    return () => clearInterval(timer);
  }, [todayRecord, calculateWorkingTime, dailyRefreshCheck, user?.id, dispatch]);

  // Initial daily refresh check setup
  useEffect(() => {
    setDailyRefreshCheck(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [todayRecord]);

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 animate-fade-in w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-in-left">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold">Attendance Tracking</h2>
          <p className="text-muted-foreground mt-1">
            Track your work hours and attendance with real-time precision
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover-lift transition-smooth border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Status
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-500/10">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {todayRecord?.time_in ? "Checked In" : "Not Checked In"}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {todayRecord?.time_in
                ? `Since ${todayRecord.time_in}`
                : "Click to check in"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
            <div className="p-2 rounded-full bg-green-500/10">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {todayRecord?.time_in && !todayRecord?.time_out 
                ? liveWorkingTime || "0h 0m"
                : todayRecord?.workinghours && todayRecord?.workingminutes
                ? `${todayRecord.workinghours}h ${todayRecord.workingminutes}m`
                : "0h 0m"
              }
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {todayRecord?.time_out ? "Work completed" : todayRecord?.time_in ? "Live timer" : "Not started"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth border-0 shadow-lg sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <div className="p-2 rounded-full bg-purple-500/10">
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {todayRecord?.workinghours && todayRecord?.workingminutes
                ? `${todayRecord.workinghours}h ${todayRecord.workingminutes}m`
                : "0h 0m"}
            </div>
            <p className="text-xs text-muted-foreground">Total hours worked</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Clock Card */}
      {/* <Card className="hover-lift transition-smooth border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Current Time
          </CardTitle>
          <CardDescription>Real-time clock and session info</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-blue-600 mb-2">
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            {todayRecord?.time_in && !todayRecord?.time_out && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Active Session: {liveWorkingTime}</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Checked in at {todayRecord.time_in}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card> */}

      <Card className="hover-lift transition-smooth border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Check in and out for the day with accurate timing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleClockIn}
              disabled={!!todayRecord?.time_in}
              variant="default"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Check In
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={!todayRecord?.time_in || !!todayRecord?.time_out}
              variant="default"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          </div>
          {todayRecord?.time_in && !todayRecord?.time_out && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Active Session: {liveWorkingTime}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Checked in at {todayRecord.time_in}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Current Time
                  </div>
                  <div className="text-sm font-mono text-blue-700 dark:text-blue-300">
                    {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="hover-lift transition-smooth border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your recent attendance records with live updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">In Time</TableHead>
                  <TableHead className="whitespace-nowrap">Out Time</TableHead>
                  <TableHead className="whitespace-nowrap">Working Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance
                  .filter((record) => record.employee_id === user?.id)
                  .slice(0, 10)
                  .map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="whitespace-nowrap font-medium">{record.date}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.time_in}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.time_out || "In Progress"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {record.time_out 
                          ? (typeof record.workinghours === "number" && typeof record.workingminutes === "number"
                            ? `${record.workinghours}h ${record.workingminutes}m`
                            : "Completed")
                          : record.time_in 
                          ? (record.employee_id === user?.id && record.date === new Date().toISOString().split('T')[0]
                            ? liveWorkingTime || "In Progress"
                            : "In Progress")
                          : "Not Started"
                        }
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracking;