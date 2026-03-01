import { useEffect, useState, useCallback } from "react";
import { Clock, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/hooks/useAppSelector";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_BASE_URL } from "@/constant/Config";

type DayStatus = "Present" | "Leave" | "Week Off";

interface CalendarDay {
  date: string;
  status: DayStatus;
  workMode?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  workingHours?: number;
}

interface CalendarResponse {
  success: boolean;
  days: CalendarDay[];
  statistics: {
    presentDays: number;
    leaveDays: number;
    weekOffDays: number;
    totalHours: string;
  };
}

type SortKey = "date" | "checkIn" | "checkOut" | "hours" | "mode" | "status";

interface AttendanceRow {
  id: string;
  date: string;
  checkInLabel: string;
  checkOutLabel: string;
  workMode: string;
  totalLabel: string;
  status: DayStatus;
}

interface Summary {
  totalDays: number;
  presentDays: number;
  leaveDays: number;
  weekOffDays: number;
  totalHoursLabel: string;
}

const AttendanceTracking = () => {
  const { token } = useAppSelector((state) => state.auth);

  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState<Summary>({
    totalDays: 0,
    presentDays: 0,
    leaveDays: 0,
    weekOffDays: 0,
    totalHoursLabel: "0h 0m",
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const [filterStart, setFilterStart] = useState<string>(todayStr);
  const [filterEnd, setFilterEnd] = useState<string>(todayStr);
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const fetchAttendance = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }
      const res = await fetch(
        `${API_BASE_URL}/api/attendance/calendar?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) {
        throw new Error("Failed to load attendance");
      }
      const data: CalendarResponse = await res.json();
      if (!data.success || !Array.isArray(data.days)) {
        setRows([]);
        setSummary({
          totalDays: 0,
          presentDays: 0,
          leaveDays: 0,
          weekOffDays: 0,
          totalHoursLabel: "0h 0m",
        });
        return;
      }

      const mapped: AttendanceRow[] = data.days.map((day) => {
        let checkInLabel = "-";
        if (day.checkInTime) {
          const d = new Date(day.checkInTime);
          checkInLabel = Number.isNaN(d.getTime())
            ? day.checkInTime
            : d.toLocaleTimeString("en-IN", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              });
        }

        let checkOutLabel = "-";
        if (day.checkOutTime) {
          const d = new Date(day.checkOutTime);
          checkOutLabel = Number.isNaN(d.getTime())
            ? day.checkOutTime
            : d.toLocaleTimeString("en-IN", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              });
        }

        let totalLabel = "0h 0m";
        if (typeof day.workingHours === "number") {
          const h = Math.floor(day.workingHours);
          const m = Math.round((day.workingHours - h) * 60);
          totalLabel = `${h}h ${m}m`;
        }

        const workMode = day.workMode || "-";

        return {
          id: day.date,
          date: day.date,
          checkInLabel,
          checkOutLabel,
          workMode,
          totalLabel,
          status: day.status,
        };
      });

      setRows(mapped);

      setSummary({
        totalDays: data.days.length,
        presentDays: data.statistics.presentDays,
        leaveDays: data.statistics.leaveDays,
        weekOffDays: data.statistics.weekOffDays,
        totalHoursLabel: data.statistics.totalHours,
      });
    } catch (err) {
      setRows([]);
      setSummary({
        totalDays: 0,
        presentDays: 0,
        leaveDays: 0,
        weekOffDays: 0,
        totalHoursLabel: "0h 0m",
      });
      const message = err instanceof Error ? err.message : "Unable to load attendance";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const sortedRows = [...rows].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "date") {
      return a.date.localeCompare(b.date) * dir;
    }
    if (sortKey === "checkIn") {
      return a.checkInLabel.localeCompare(b.checkInLabel) * dir;
    }
    if (sortKey === "checkOut") {
      return a.checkOutLabel.localeCompare(b.checkOutLabel) * dir;
    }
    if (sortKey === "hours") {
      return a.totalLabel.localeCompare(b.totalLabel) * dir;
    }
    if (sortKey === "mode") {
      return a.workMode.localeCompare(b.workMode) * dir;
    }
    if (sortKey === "status") {
      return a.status.localeCompare(b.status) * dir;
    }
    return 0;
  });

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const current = Math.min(currentPage, totalPages);
  const start = (current - 1) * pageSize;
  const paginatedRows = sortedRows.slice(start, start + pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="w-full min-h-full bg-background p-4 md:p-6 lg:p-8">
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Attendance Overview
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Monthly calendar view with status for each day.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Calendar className="h-4 w-4" />
            <span className="hidden lg:inline">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="lg:hidden">
              {new Date().toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

      

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Days</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary.presentDays}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Days</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary.leaveDays}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Week Off Days</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {summary.weekOffDays}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {summary.totalHoursLabel}
              </div>
            </CardContent>
          </Card>
        </div>


  <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Filter by Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-1 text-sm">
                <span>Start Date</span>
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm bg-background"
                  value={filterStart}
                  max={todayStr}
                  onChange={(e) => setFilterStart(e.target.value)}
                />
              </div>
              <div className="grid gap-1 text-sm">
                <span>End Date</span>
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm bg-background"
                  value={filterEnd}
                  max={todayStr}
                  onChange={(e) => setFilterEnd(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm w-full sm:w-auto"
                  onClick={() => {
                    if (!filterStart || !filterEnd) {
                      toast.error("Please select both start and end dates.");
                      return;
                    }
                    if (filterStart > filterEnd) {
                      toast.error("Start date cannot be after end date.");
                      return;
                    }
                    const today = todayStr;
                    const end = filterEnd > today ? today : filterEnd;
                    setStartDate(filterStart);
                    setEndDate(end);
                    setCurrentPage(1);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </CardContent>
        </Card>


        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      Date
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("checkIn")}
                    >
                      Check-In
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("checkOut")}
                    >
                      Check-Out
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("hours")}
                    >
                      Total Hours
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("mode")}
                    >
                      Mode
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-sm">
                        Loading attendance...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && error && rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-sm">
                        {error}
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && !error && rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-sm">
                        No attendance records found.
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading &&
                    !error &&
                    paginatedRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.checkInLabel}</TableCell>
                        <TableCell>{row.checkOutLabel}</TableCell>
                        <TableCell>{row.totalLabel}</TableCell>
                        <TableCell>{row.workMode}</TableCell>
                        <TableCell>
                          {row.status === "Present" && (
                            <span className="text-green-600">Present</span>
                          )}
                          {row.status === "Leave" && (
                            <span className="text-red-600">Leave</span>
                          )}
                          {row.status === "Week Off" && (
                            <span className="text-yellow-600">Week Off</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            {rows.length > 0 && (
              <div className="flex items-center justify-between mt-4 text-xs sm:text-sm">
                <div>
                  Page {current} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-2 py-1 rounded border text-xs disabled:opacity-50"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={current === 1}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 rounded border text-xs disabled:opacity-50"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={current === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceTracking;
