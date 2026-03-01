import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/constant/Config";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EmployeeDetailsResponse {
  success?: boolean;
  employee?: {
    _id: string;
    name: string;
    email: string;
    employeeId?: string;
    department?: string;
    phone?: string;
    phoneNumber?: string;
    isActive?: boolean;
    createdAt?: string;
    position?: string;
  };
  attendanceSummary?: {
    totalDays?: number;
    totalHours?: string;
    presentDays?: number;
  };
  pendingLeaves?: number;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  workMode?: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
}

interface AdminLeaveRequestBackend {
  _id: string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  leaveType?: string;
  status?: string;
}

interface LeaveRequestResponse {
  success?: boolean;
  leaveRequests?: AdminLeaveRequestBackend[];
}

interface LeaveRecord {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  type: string;
  status: string;
}

export const EmployeeAttendanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<EmployeeDetailsResponse["employee"] | null>(null);

  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchEmployee = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load employee details",
          variant: "destructive",
        });
        return;
      }
      const data: EmployeeDetailsResponse = await res.json();
      if (!data.success || !data.employee) {
        setLoading(false);
        toast({
          title: "Error",
          description: "Unexpected response while loading employee",
          variant: "destructive",
        });
        return;
      }
      setEmployee(data.employee);
    } catch {
      toast({
        title: "Error",
        description: "Network error while loading employee",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  const fetchAttendanceAndLeaves = useCallback(async () => {
    if (!token || !id) {
      return;
    }
    try {
      setAttendanceLoading(true);

      const attendanceParams = new URLSearchParams();
      attendanceParams.append("userId", String(id));
      if (startDate) {
        attendanceParams.append("startDate", startDate);
      }
      if (endDate) {
        attendanceParams.append("endDate", endDate);
      }
      attendanceParams.append("page", "1");
      attendanceParams.append("limit", "365");

      const attendanceRes = await fetch(
        `${API_BASE_URL}/admin/attendance?${attendanceParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (attendanceRes.ok) {
        const attendanceJson: {
          success?: boolean;
          records?: AttendanceRecord[];
        } = await attendanceRes.json();
        if (attendanceJson.success && Array.isArray(attendanceJson.records)) {
          setAttendanceRecords(attendanceJson.records);
        } else {
          setAttendanceRecords([]);
        }
      } else {
        setAttendanceRecords([]);
      }

      const leaveParams = new URLSearchParams();
      leaveParams.append("status", "approved");
      leaveParams.append("userId", String(id));
      if (startDate) {
        leaveParams.append("startDate", startDate);
      }
      if (endDate) {
        leaveParams.append("endDate", endDate);
      }
      leaveParams.append("page", "1");
      leaveParams.append("limit", "365");

      const leaveRes = await fetch(
        `${API_BASE_URL}/admin/leave-requests?${leaveParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (leaveRes.ok) {
        const leaveJson: LeaveRequestResponse = await leaveRes.json();
        if (leaveJson.success && Array.isArray(leaveJson.leaveRequests)) {
          const mapped: LeaveRecord[] = leaveJson.leaveRequests.map((r) => ({
            id: String(r._id),
            startDate: r.startDate,
            endDate: r.endDate,
            days: r.totalDays || 0,
            type: r.leaveType || "other",
            status: r.status || "",
          }));
          setLeaveRecords(mapped);
        } else {
          setLeaveRecords([]);
        }
      } else {
        setLeaveRecords([]);
      }
    } catch {
      setAttendanceRecords([]);
      setLeaveRecords([]);
    } finally {
      setAttendanceLoading(false);
    }
  }, [id, token, startDate, endDate]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  useEffect(() => {
    fetchAttendanceAndLeaves();
  }, [fetchAttendanceAndLeaves]);

  const dayCounts = useMemo(() => {
    if (!startDate || !endDate) {
      return {
        presentDays: 0,
        leaveDays: 0,
        absentDays: 0,
        totalWorkingHoursLabel: "0h 0m",
      };
    }

    const presentDates = new Set<string>();
    attendanceRecords.forEach((record) => {
      if (record.date) {
        const d = new Date(record.date);
        const key = d.toISOString().split("T")[0];
        presentDates.add(key);
      }
    });

    const leaveDates = new Set<string>();
    leaveRecords.forEach((leave) => {
      if (!leave.startDate || !leave.endDate) {
        return;
      }
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const current = new Date(start);
      while (current <= end) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) {
          const key = current.toISOString().split("T")[0];
          leaveDates.add(key);
        }
        current.setDate(current.getDate() + 1);
      }
    });

    const start = new Date(startDate);
    const end = new Date(endDate);

    let present = 0;
    let leave = 0;
    let absent = 0;

    const cursor = new Date(start);
    while (cursor <= end) {
      const day = cursor.getDay();
      if (day !== 0 && day !== 6) {
        const key = cursor.toISOString().split("T")[0];
        if (presentDates.has(key)) {
          present += 1;
        } else if (leaveDates.has(key)) {
          leave += 1;
        } else {
          absent += 1;
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    let totalWorkingHours = 0;
    attendanceRecords.forEach((record) => {
      if (typeof record.workingHours === "number") {
        totalWorkingHours += record.workingHours;
      }
    });
    const wholeHours = Math.floor(totalWorkingHours);
    const minutes = Math.round((totalWorkingHours - wholeHours) * 60);
    const totalWorkingHoursLabel = `${wholeHours}h ${minutes}m`;

    return {
      presentDays: present,
      leaveDays: leave,
      absentDays: absent,
      totalWorkingHoursLabel,
    };
  }, [attendanceRecords, leaveRecords, startDate, endDate]);

  const formattedAttendanceRows = useMemo(() => {
    if (!startDate || !endDate) {
      return attendanceRecords.map((record) => {
        const dateLabel = record.date
          ? format(new Date(record.date), "yyyy-MM-dd")
          : "-";

        let checkIn = "-";
        if (record.checkInTime) {
          const d = new Date(record.checkInTime);
          checkIn = Number.isNaN(d.getTime())
            ? record.checkInTime
            : d.toLocaleTimeString("en-IN", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              });
        }

        let checkOut = "-";
        if (record.checkOutTime) {
          const d = new Date(record.checkOutTime);
          checkOut = Number.isNaN(d.getTime())
            ? record.checkOutTime
            : d.toLocaleTimeString("en-IN", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              });
        }

        let totalHours = "-";
        if (typeof record.workingHours === "number") {
          totalHours = `${record.workingHours}h`;
        }

        const workMode = record.workMode || "-";

        return {
          id: record._id,
          dateLabel,
          checkIn,
          checkOut,
          totalHours,
          workMode,
          isLeave: false,
        };
      });
    }

    const attendanceByDate = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach((record) => {
      if (!record.date) {
        return;
      }
      const d = new Date(record.date);
      const key = d.toISOString().split("T")[0];
      if (!attendanceByDate.has(key)) {
        attendanceByDate.set(key, record);
      }
    });

    const rows: {
      id: string;
      dateLabel: string;
      checkIn: string;
      checkOut: string;
      totalHours: string;
      workMode: string;
      isLeave: boolean;
    }[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const cursor = new Date(start);

    while (cursor <= end) {
      const key = cursor.toISOString().split("T")[0];
      const record = attendanceByDate.get(key);

      if (record) {
        const dateLabel = format(new Date(record.date), "yyyy-MM-dd");

        let checkIn = "-";
        if (record.checkInTime) {
          const d = new Date(record.checkInTime);
          checkIn = Number.isNaN(d.getTime())
            ? record.checkInTime
            : d.toLocaleTimeString("en-IN", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              });
        }

        let checkOut = "-";
        if (record.checkOutTime) {
          const d = new Date(record.checkOutTime);
          checkOut = Number.isNaN(d.getTime())
            ? record.checkOutTime
            : d.toLocaleTimeString("en-IN", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              });
        }

        let totalHours = "-";
        if (typeof record.workingHours === "number") {
          totalHours = `${record.workingHours}h`;
        }

        const workMode = record.workMode || "-";

        rows.push({
          id: record._id,
          dateLabel,
          checkIn,
          checkOut,
          totalHours,
          workMode,
          isLeave: false,
        });
      } else {
        const dateLabel = format(cursor, "yyyy-MM-dd");
        rows.push({
          id: key,
          dateLabel,
          checkIn: "-",
          checkOut: "-",
          totalHours: "Leave",
          workMode: "-",
          isLeave: true,
        });
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return rows;
  }, [attendanceRecords, startDate, endDate]);

  if (loading) {
    return (
      <div className="w-full min-h-full bg-background">
        <div className="p-4 md:p-6 lg:p-8">Loading...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="w-full min-h-full bg-background">
        <div className="p-4 md:p-6 lg:p-8">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <div className="mt-4">Employee not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Employee Attendance</h2>
              <p className="text-muted-foreground">
                Detailed attendance and leave summary for this employee.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/admin/attendance")}>
                Back to Attendance List
              </Button>
            </div>
          </div>

      

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Present Days</CardTitle>
                <CardDescription>Selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dayCounts.presentDays}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Absent Days</CardTitle>
                <CardDescription>Selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dayCounts.absentDays}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Working Hours</CardTitle>
                <CardDescription>Selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dayCounts.totalWorkingHoursLabel}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Attendance Details</CardTitle>
              <CardDescription>
                Daily attendance records for the selected date range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3 mb-4">
                <div className="grid gap-2">
                  <div className="text-sm">Start Date</div>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-sm">End Date</div>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      fetchAttendanceAndLeaves();
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Work Mode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">
                          Loading attendance...
                        </TableCell>
                      </TableRow>
                    ) : formattedAttendanceRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">
                          No attendance records found for this period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      formattedAttendanceRows.map((row) => (
                        <TableRow
                          key={row.id}
                          className={
                            row.isLeave
                              ? "bg-red-50 text-red-900 dark:bg-red-550 dark:text-red-600"
                              : ""
                          }
                        >
                          <TableCell>{row.dateLabel}</TableCell>
                          <TableCell>{row.checkIn}</TableCell>
                          <TableCell>{row.checkOut}</TableCell>
                          <TableCell>{row.totalHours}</TableCell>
                          <TableCell>{row.workMode}</TableCell>
                        </TableRow>
                      ))
                    )}
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
