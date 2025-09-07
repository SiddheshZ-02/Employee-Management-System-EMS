import { useEffect, useState } from "react";
import { Clock, Calendar, CheckCircle, XCircle } from "lucide-react";
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

const AttendanceTracking = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { todayRecord } = useAppSelector((state) => state.attendance);
  const dispatch = useAppDispatch();
  const [attendance, setAttencdance] = useState<AttendanceRecord[]>([]);
  console.log(attendance);

  useEffect(() => {
    if (user?.id) {
      dispatch(loadTodayRecord({ employeeId: user.id }));
    }
  }, [user?.id, dispatch]);

  const handleClockIn = async () => {
    if (user?.id) {
      const today = new Date().toISOString().split("T")[0];
      const time_in = new Date().toLocaleTimeString();
      try {
        const response = await fetch("https://ems-api-data.onrender.com/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_id: user.id,
            date: today,
            time_in,
            time_out: "",
            workinghours: 0,
          }),
        });
        const record = await response.json();
        if (response.ok) {
          dispatch(clockIn({ record }));
          toast.success("Clocked in successfully!");
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
      const time_out = new Date().toLocaleTimeString();
      // Calculate working hours and minutes
      const clockInDate = new Date(`2000-01-01 ${todayRecord.time_in}`);
      const clockOutDate = new Date(`2000-01-01 ${time_out}`);
      const diffMs = clockOutDate.getTime() - clockInDate.getTime();
      const totalMinutes = Math.floor(Math.abs(diffMs / (1000 * 60)));
      const workinghours = Math.floor(totalMinutes / 60);
      const workingminutes = totalMinutes % 60;
      try {
        const response = await fetch(
          `https://ems-api-data.onrender.com/attendance/${todayRecord.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...todayRecord,
              time_out,
              workinghours,
              workingminutes,
            }),
          }
        );
        const record = await response.json();
        if (response.ok) {
          dispatch(clockOut({ record }));
          toast.success("Clocked out successfully!");
          fetchAttendance();
          dispatch(loadTodayRecord({ employeeId: user.id })); // reload today's record
        } else {
          toast.error(
            "Failed to clock out: " +
              (record?.message || JSON.stringify(record))
          );
        }
      } catch (error) {
        toast.error(
          "Error clocking out: " +
            (error instanceof Error ? error.message : String(error))
        );
      }
    }
  };

  const fetchAttendance = async () => {
      try {
        const response = await fetch("https://ems-api-data.onrender.com/attendance", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await response.json();
        setAttencdance(res);
      } catch (error) {
        console.log("Error fetching attendance data:", error);
      }
  };

  useEffect(() => {
    fetchAttendance();
  }, [todayRecord]);

  // const userRecords = attendance
  //   .filter((record) => record.employee_id === user?.id)
  //   .slice(0, 7);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold">Attendance Tracking</h2>
        <p className="text-muted-foreground mt-1">
          Track your work hours and attendance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-elegant border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Status
            </CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayRecord?.time_in ? "Checked In" : "Not Checked In"}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayRecord?.time_in
                ? `Since ${todayRecord.time_in}`
                : "Click to check in"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayRecord?.workinghours?.toFixed(1) || "0.0"}h
            </div>
            <p className="text-xs text-muted-foreground">
              {todayRecord?.time_out ? "Work completed" : "Currently working"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">    {todayRecord?.workinghours?.toFixed(1) || "0.0"}h</div>
            <p className="text-xs text-muted-foreground">Total hours worked</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Check in and out for the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={handleClockIn}
              disabled={!!todayRecord?.time_in}
              variant="default"
              className="bg-grey-900 hover:bg-blue-800 focus-visible:ring ring-gray-300 text-black shadow-md hover:shadow-glow transition-smooth"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              CheckIn
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={!todayRecord?.time_in || !!todayRecord?.time_out}
              variant="default"
              className="bg-grey-900  hover:bg-blue-800 focus-visible:ring ring-gray-300 text-black shadow-md hover:shadow-glow transition-smooth"
            >
              <XCircle className="h-4 w-4 mr-2" />
              CheckOut
            </Button>
          </div>
          {todayRecord?.time_in && !todayRecord?.time_out && (
            <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-lg">
              <p className="text-sm text-info-foreground">
                You're currently clocked in since {todayRecord.time_in}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-elegant border-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>In Time</TableHead>
                <TableHead>Out Time</TableHead>
                <TableHead>Working Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance
                .filter((record) => record.employee_id === user?.id)
                .map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.time_in}</TableCell>
                    <TableCell>{record.time_out || "In Progress"}</TableCell>
                    <TableCell>
                      {typeof record.workinghours === "number" && typeof record.workingminutes === "number"
                        ? `${record.workinghours}h ${record.workingminutes}m`
                        : "In Progress"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceTracking;
