import { useEffect, useState, useCallback, useMemo } from "react";
import { Clock, Calendar, CheckCircle, RotateCcw, ChevronLeft, ChevronRight, Palmtree, Info } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/constant/Config";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";
import { format, isWithinInterval, parseISO, startOfDay } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DayStatus = "Present" | "Absent" | "Leave" | "Week Off" | "Holiday" | "Half Day";

interface CalendarDay {
  date: string;
  status: DayStatus;
  workMode?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  workingHours?: number;
  isWorkOnLeave?: boolean;
}

interface CalendarResponse {
  success: boolean;
  days: CalendarDay[];
  statistics: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    leaveDays: number;
    weekOffDays: number;
    holidayDays: number;
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
  isWorkOnLeave?: boolean;
}

interface Summary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  weekOffDays: number;
  holidayDays: number;
  totalHoursLabel: string;
}

const AttendanceTracking = () => {
  const { token, user } = useAppSelector((state) => state.auth);

  // Use user's creation date as the minimum possible date for attendance
  const accountCreatedAt = user?.createdAt ? new Date(user.createdAt) : new Date("2024-01-01");
  const accountCreatedAtStr = accountCreatedAt.toISOString().split("T")[0];

  // Calculate default 30 days range
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // If account was created less than 30 days ago, use creation date as start
  const defaultStartDate = thirtyDaysAgo < accountCreatedAt ? accountCreatedAtStr : thirtyDaysAgo.toISOString().split("T")[0];

  const todayStr = today.toISOString().split("T")[0];

  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    weekOffDays: 0,
    holidayDays: 0,
    totalHoursLabel: "0h 0m",
  });

  const [filterStart, setFilterStart] = useState<string>(defaultStartDate);
  const [filterEnd, setFilterEnd] = useState<string>(todayStr);
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const fetchAttendance = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch attendance from backend
      const params = new URLSearchParams();
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }

      const attendanceRes = await fetch(`${API_BASE_URL}/api/attendance/calendar?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!attendanceRes.ok) {
        throw new Error("Failed to load attendance");
      }
      
      const data: CalendarResponse = await attendanceRes.json();
      
      if (!data.success || !Array.isArray(data.days)) {
        setRows([]);
        setSummary({
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          leaveDays: 0,
          weekOffDays: 0,
          holidayDays: 0,
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
          isWorkOnLeave: day.isWorkOnLeave,
        };
      });

      setRows(mapped);

      // Use pre-calculated summary stats from backend
      setSummary({
        totalDays: data.statistics.totalDays,
        presentDays: data.statistics.presentDays,
        absentDays: data.statistics.absentDays,
        leaveDays: data.statistics.leaveDays,
        weekOffDays: data.statistics.weekOffDays,
        holidayDays: data.statistics.holidayDays,
        totalHoursLabel: data.statistics.totalHours,
      });
    } catch (err) {
      setRows([]);
      setSummary({
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        leaveDays: 0,
        weekOffDays: 0,
        holidayDays: 0,
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

  const resetFilters = () => {
    setFilterStart(defaultStartDate);
    setFilterEnd(todayStr);
    setStartDate(defaultStartDate);
    setEndDate(todayStr);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: DayStatus, isWorkOnLeave?: boolean) => {
    switch (status) {
      case "Present":
        return (
          <div className="flex flex-col items-center gap-1">
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">Present</Badge>
            {isWorkOnLeave && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-amber-500/50 text-amber-600 bg-amber-50/50 cursor-help">
                      Work on Leave
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Worked on an approved leave day.</p>
                    <p className="text-[10px] text-muted-foreground">Balance should be adjusted by HR.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      case "Absent":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20">Absent</Badge>;
      case "Half Day":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20">Half Day</Badge>;
      case "Leave":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">Leave</Badge>;
      case "Week Off":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20">Week Off</Badge>;
      case "Holiday":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Holiday</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="w-full min-h-full bg-background p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Attendance Overview
          </h2>
          <p className="text-muted-foreground">
            View and manage your attendance records with detailed analytics.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-md shadow-sm text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            {new Date().toLocaleDateString("en-IN", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border shadow-sm bg-card overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.presentDays}</div>
            <p className="text-xs text-muted-foreground mt-1">Total present days</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
            <div className="h-4 w-4 rounded-full border-2 border-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.absentDays}</div>
            <p className="text-xs text-muted-foreground mt-1">Days not marked</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekoff</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.weekOffDays}</div>
            <p className="text-xs text-muted-foreground mt-1">Standard weekends</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leaves</CardTitle>
            <Palmtree className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.leaveDays}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved leaves</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.totalHoursLabel}</div>
            <p className="text-xs text-muted-foreground mt-1">Total work time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="border shadow-sm bg-card">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Custom Date Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="grid gap-2 flex-1 w-full">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground cursor-pointer [appearance:none] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  value={filterStart}
                  min={accountCreatedAtStr}
                  max={todayStr}
                  onChange={(e) => setFilterStart(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch (err) {
                      console.debug("showPicker not supported or failed", err);
                    }
                  }}
                />
              </div>
            </div>
            <div className="grid gap-2 flex-1 w-full">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground cursor-pointer [appearance:none] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  value={filterEnd}
                  min={accountCreatedAtStr}
                  max={todayStr}
                  onChange={(e) => setFilterEnd(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch (err) {
                      console.debug("showPicker not supported or failed", err);
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                type="button"
                className="flex-1 md:flex-none px-6 h-[42px] shadow-sm"
                onClick={() => {
                  if (!filterStart || !filterEnd) {
                    toast.error("Please select both start and end dates.");
                    return;
                  }
                  if (filterStart > filterEnd) {
                    toast.error("Start date cannot be after end date.");
                    return;
                  }
                  setStartDate(filterStart);
                  setEndDate(filterEnd);
                  setCurrentPage(1);
                }}
              >
                Apply Filter
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-[42px] w-[42px] border-border hover:bg-muted"
                onClick={resetFilters}
                title="Reset Filters"
              >
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance History Table */}
      <Card className="border shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Attendance History</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Showing records from {startDate} to {endDate}</p>
          </div>
          <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {rows.length} Records
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[150px] font-semibold text-foreground cursor-pointer text-center" onClick={() => handleSort("date")}>
                    <div className="flex items-center justify-center gap-2">Date {sortKey === "date" && (sortDir === "asc" ? "↑" : "↓")}</div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground cursor-pointer text-center" onClick={() => handleSort("checkIn")}>
                    <div className="flex items-center justify-center gap-2">Check-In {sortKey === "checkIn" && (sortDir === "asc" ? "↑" : "↓")}</div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground cursor-pointer text-center" onClick={() => handleSort("checkOut")}>
                    <div className="flex items-center justify-center gap-2">Check-Out {sortKey === "checkOut" && (sortDir === "asc" ? "↑" : "↓")}</div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground cursor-pointer text-center" onClick={() => handleSort("hours")}>
                    <div className="flex items-center justify-center gap-2">Hours Worked {sortKey === "hours" && (sortDir === "asc" ? "↑" : "↓")}</div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground cursor-pointer text-center" onClick={() => handleSort("mode")}>
                    <div className="flex items-center justify-center gap-2">Mode {sortKey === "mode" && (sortDir === "asc" ? "↑" : "↓")}</div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground cursor-pointer text-center" onClick={() => handleSort("status")}>
                    <div className="flex items-center justify-center gap-2">Status {sortKey === "status" && (sortDir === "asc" ? "↑" : "↓")}</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-muted-foreground font-medium">Fetching records...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="text-destructive font-medium">{error}</div>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Calendar className="h-10 w-10 opacity-20" />
                        <span className="font-medium">No records found for the selected period.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/30 transition-colors border-b last:border-0">
                      <TableCell className="font-medium text-foreground text-center">
                        {new Date(row.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="h-3.5 w-3.5 opacity-60" />
                          {row.checkInLabel}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="h-3.5 w-3.5 opacity-60" />
                          {row.checkOutLabel}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-foreground text-xs font-semibold">
                          {row.totalLabel}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center">
                        {row.workMode === "Office" ? (
                          <Badge variant="outline" className="font-normal">Office</Badge>
                        ) : row.workMode === "WFH" ? (
                          <Badge variant="outline" className="font-normal">Remote</Badge>
                        ) : (
                          <span className="opacity-60">{row.workMode}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(row.status, row.isWorkOnLeave)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {!loading && rows.length > 0 && (
            <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{start + 1}</span> to{" "}
                <span className="font-semibold text-foreground">{Math.min(start + pageSize, rows.length)}</span> of{" "}
                <span className="font-semibold text-foreground">{rows.length}</span> records
              </div>
              
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={current === 1}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (current <= 3) pageNum = i + 1;
                    else if (current >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = current - 2 + i;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={current === pageNum ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0 ${current === pageNum ? "shadow-sm" : ""}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={current === totalPages}
                  className="h-8 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTracking;
