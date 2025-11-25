import { useEffect, useState, useCallback } from "react";
import { Clock, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import {
  clockIn,
  clockOut,
  loadTodayRecord,
} from "@/store/slices/attendanceSlice";
import { resetTodayRecord } from "@/store/slices/attendanceSlice";
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

const LOCAL_KEY = "attendance_offline_records";
const TODAY_KEY = "today_record";

const AttendanceTracking = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { todayRecord } = useAppSelector((state) => state.attendance);
  const dispatch = useAppDispatch();

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [liveWorkingTime, setLiveWorkingTime] = useState("");

  // ⏱️ Calculate working time difference
  const calculateWorkingTime = useCallback(
    (timeIn: string, timeOut?: string) => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const clockInTime = new Date(`${today}T${timeIn}`);
        const clockOutTime = timeOut
          ? new Date(`${today}T${timeOut}`)
          : new Date();

        if (clockOutTime < clockInTime) {
          clockOutTime.setDate(clockOutTime.getDate() + 1);
        }

        const diffMs = clockOutTime.getTime() - clockInTime.getTime();
        const totalMinutes = Math.floor(diffMs / 60000);
        const workinghours = Math.floor(totalMinutes / 60);
        const workingminutes = totalMinutes % 60;

        return { workinghours, workingminutes, totalMinutes };
      } catch {
        return { workinghours: 0, workingminutes: 0, totalMinutes: 0 };
      }
    },
    []
  );

  // 🧩 Fetch Attendance (API + Cache fallback)
  const fetchAttendance = async () => {
    try {
      const res = await fetch(BASE_URL + `/attendance`);
      if (!res.ok) throw new Error("Failed to load attendance");
      const data = await res.json();
      setAttendance(data);
      localStorage.setItem("attendance_cache", JSON.stringify(data));
    } catch {
      const cached = localStorage.getItem("attendance_cache");
      if (cached) {
        setAttendance(JSON.parse(cached));
        toast.warning("Offline: showing cached attendance");
      }
    }
  };

  // 🕐 Clock In
  const handleClockIn = async () => {
    if (!user?.id) return;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const time_in = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      employee_id: user.id,
      date: today,
      time_in,
      time_out: "",
      workinghours: 0,
      workingminutes: 0,
    };

    try {
      const res = await fetch(BASE_URL + `/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });

      if (!res.ok) throw new Error("API down");

      const saved = await res.json();
      dispatch(clockIn({ record: saved }));
      localStorage.setItem(TODAY_KEY, JSON.stringify(saved));
      toast.success(`Clocked in successfully at ${time_in}`);
      fetchAttendance();
    } catch {
      // 📴 Offline Fallback
      toast.warning("Offline: saved locally");
      const offlineRecords =
        JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]") || [];
      offlineRecords.push({ ...record, synced: false });
      localStorage.setItem(LOCAL_KEY, JSON.stringify(offlineRecords));
      localStorage.setItem(TODAY_KEY, JSON.stringify(record));
      dispatch(clockIn({ record }));
    }
  };

  // 🕐 Clock Out
  const handleClockOut = async () => {
    if (!user?.id || !todayRecord?.time_in) return;

    const now = new Date();
    const time_out = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const { workinghours, workingminutes } = calculateWorkingTime(
      todayRecord.time_in,
      time_out
    );

    const updatedRecord = {
      ...todayRecord,
      time_out,
      workinghours,
      workingminutes,
    };

    try {
      const res = await fetch(BASE_URL + `/attendance/${todayRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecord),
      });

      if (!res.ok) throw new Error("API down");

      const saved = await res.json();
      dispatch(clockOut({ record: saved }));
      localStorage.setItem(TODAY_KEY, JSON.stringify(saved));
      toast.success(
        `Clocked out successfully at ${time_out}! Worked ${workinghours}h ${workingminutes}m`
      );
      fetchAttendance();
    } catch {
      // 📴 Offline Fallback
      toast.warning("Offline: checkout saved locally");
      const offlineRecords =
        JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]") || [];
      offlineRecords.push({ ...updatedRecord, synced: false });
      localStorage.setItem(LOCAL_KEY, JSON.stringify(offlineRecords));
      localStorage.setItem(TODAY_KEY, JSON.stringify(updatedRecord));
      dispatch(clockOut({ record: updatedRecord }));
    }
  };

  // 🔄 Sync Offline Records to API
  const syncOfflineRecords = useCallback(async () => {
    const offlineRecords: AttendanceRecord[] = JSON.parse(
      localStorage.getItem(LOCAL_KEY) || "[]"
    );
    if (!offlineRecords.length) return;

    let synced = 0;

    for (const record of offlineRecords) {
      try {
        let res;
        if (!record.time_out) {
          // New record
          res = await fetch(BASE_URL + "/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record),
          });
          if (res.ok) {
            const saved = await res.json();
            record.id = saved.id;
            record.synced = true;
            synced++;
          }
        } else {
          // Update record
          res = await fetch(BASE_URL + `/attendance/${record.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record),
          });
          if (res.ok) {
            record.synced = true;
            synced++;
          }
        }
      } catch {
        console.log("Still offline for:", record.date);
      }
    }

    const remaining = offlineRecords.filter((r) => !r.synced);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(remaining));
    if (synced > 0) {
      toast.success(`✅ Synced ${synced} record(s) successfully`);
      fetchAttendance();
    }
  }, []);

  // 🔁 Auto sync every 30 seconds
  useEffect(() => {
    const interval = setInterval(syncOfflineRecords, 30000);
    return () => clearInterval(interval);
  }, [syncOfflineRecords]);

  // 🌐 Sync immediately when back online
  useEffect(() => {
    const handleOnline = () => {
      toast.info("You're back online! Syncing attendance...");
      syncOfflineRecords();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncOfflineRecords]);

  // 🧭 Detect new day and reset today's record (fix: also reset Hours Today)
  useEffect(() => {
    const checkNewDay = () => {
      const currentDate = new Date().toISOString().split("T")[0];
      const lastDate = localStorage.getItem("last_date_check");

      // if date has changed, reset everything for the new day
      if (lastDate !== currentDate) {
        localStorage.setItem("last_date_check", currentDate);

        // clear old record and reset UI state
        localStorage.removeItem(TODAY_KEY);
        setLiveWorkingTime("0h 0m"); // ✅ Reset Hours Today card
        dispatch(resetTodayRecord()); // ✅ reset Redux state

        if (user?.id) {
          dispatch(loadTodayRecord({ employeeId: user.id }));
          fetchAttendance();
        }

        toast.success("🕗 New day detected — attendance reset!");
      }
    };

    checkNewDay();
    const interval = setInterval(checkNewDay, 60000); // check every 1 min
    return () => clearInterval(interval);
  }, [user?.id, dispatch]);

  // ⏰ Live clock + timer
  // ⏰ Live clock + timer
    useEffect(() => {
      const timer = setInterval(() => {
        if (todayRecord?.time_in && !todayRecord?.time_out) {
          const { workinghours, workingminutes } = calculateWorkingTime(
            todayRecord.time_in
          );
          setLiveWorkingTime(`${workinghours}h ${workingminutes}m`);
        } else {
          setLiveWorkingTime("");
        }
      }, 1000);
      return () => clearInterval(timer);
    }, [todayRecord, calculateWorkingTime]);
  // 🧠 Initial Load
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const localToday = localStorage.getItem(TODAY_KEY);

    if (localToday) {
      const parsed = JSON.parse(localToday);
      if (parsed.date !== today) {
        localStorage.removeItem(TODAY_KEY);
      } else if (user?.id === parsed.employee_id) {
        dispatch(clockIn({ record: parsed }));
      }
    } else if (user?.id) {
      dispatch(loadTodayRecord({ employeeId: user.id }));
    }

    fetchAttendance();
  }, [user?.id, dispatch]);

  // 💼 Calculate monthly total
  const getStartOfMonth = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  };
  const startDate = getStartOfMonth();

  const filteredRecords = attendance.filter(
    (r) => r.employee_id === user?.id && new Date(r.date) >= startDate
  );

  let totalMinutes = 0;
  filteredRecords.forEach((r) => {
    if (r.time_in && r.time_out) {
      const timeIn = new Date(`${r.date}T${r.time_in}`);
      const timeOut = new Date(`${r.date}T${r.time_out}`);
      if (!isNaN(timeIn.getTime()) && !isNaN(timeOut.getTime())) {
        totalMinutes += Math.floor(
          (timeOut.getTime() - timeIn.getTime()) / 60000
        );
      }
    }
  });

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <div className="w-full min-h-full bg-background p-6">
      <div className="space-y-6 w-full">
        <h2 className="text-2xl font-bold">Attendance Tracking</h2>

        {/* Status Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Today Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex justify-between">
              <CardTitle>Today's Status</CardTitle>
              <div
                className={`p-2 rounded-full ${
                  todayRecord?.time_in && !todayRecord?.time_out
                    ? "bg-green-500/10"
                    : todayRecord?.time_out
                    ? "bg-red-500/10"
                    : "bg-blue-500/10"
                }`}
              >
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {todayRecord?.time_in && !todayRecord?.time_out
                  ? "Checked In"
                  : todayRecord?.time_out
                  ? "Checked Out"
                  : "Not Checked In"}
              </div>
            </CardContent>
          </Card>

          {/* Hours Today */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex justify-between">
              <CardTitle>Hours Today</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">
                {todayRecord?.time_in && !todayRecord?.time_out
                  ? liveWorkingTime || "0h 0m"
                  : todayRecord?.workinghours
                  ? `${todayRecord.workinghours}h ${todayRecord.workingminutes}m`
                  : "0h 0m"}
              </div>
            </CardContent>
          </Card>

          {/* Month Total */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex justify-between">
              <CardTitle>This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-600">
                {totalHours}h {remainingMinutes}m
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleClockIn}
                disabled={!!todayRecord?.time_in}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Check In
              </Button>
              <Button
                onClick={handleClockOut}
                disabled={!todayRecord?.time_in || !!todayRecord?.time_out}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="h-4 w-4 mr-2" /> Check Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>In</TableHead>
                    <TableHead>Out</TableHead>
                    <TableHead>Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance
                    .filter((r) => r.employee_id === user?.id)
                    .slice(0, 10)
                    .map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.time_in}</TableCell>
                        <TableCell>{r.time_out || "In Progress"}</TableCell>
                        <TableCell>
                          {r.time_out
                            ? `${r.workinghours}h ${r.workingminutes}m`
                            : "In Progress"}
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
  );
};

export default AttendanceTracking;
