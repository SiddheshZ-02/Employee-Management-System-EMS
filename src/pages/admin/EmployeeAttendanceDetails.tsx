import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_BASE_URL } from "@/constant/Config";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Clock, Calendar, CheckCircle, RotateCcw, ChevronLeft, ChevronRight, Palmtree, ArrowLeft, Plus, Info, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";

type DayStatus = "Present" | "Absent" | "Leave" | "Week Off" | "Holiday" | "Half Day" | "Checked In";

interface LeaveType {
  _id: string;
  id?: string;
  name: string;
  yearlyCount: number;
  isActive: boolean;
}

interface EmployeeLeaveBalance {
  _id: string;
  leaveTypeId: {
    _id: string;
    name: string;
  };
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  year: string;
  expiresAt?: string;
  isAllocationBased?: boolean;
}

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
  status?: string;
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

  // Leave allocation states
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employeeBalances, setEmployeeBalances] = useState<EmployeeLeaveBalance[]>([]);
  const [isAllocating, setIsAllocating] = useState(false);
  const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState("");
  const [leaveCount, setLeaveCount] = useState("");
  const [validityDays, setValidityDays] = useState("30");

  const VALIDITY_OPTIONS = [
    { label: "7 Days", value: "7" },
    { label: "15 Days", value: "15" },
    { label: "30 Days", value: "30" },
    { label: "45 Days", value: "45" },
  ];

  const fetchLeaveData = useCallback(async () => {
    if (!token || !id) return;
    try {
      const [typesRes, balancesRes] = await Promise.all([
        apiRequest<{ success: boolean; leaveTypes: LeaveType[] }>("/api/leave/types", { token }),
        apiRequest<{ success: boolean; balances: EmployeeLeaveBalance[] }>(`/api/leave/balances?userId=${id}`, { token })
      ]);
      if (typesRes.success) setLeaveTypes(typesRes.leaveTypes.filter(t => t.isActive));
      if (balancesRes.success) setEmployeeBalances(balancesRes.balances);
    } catch (error) {
      console.error("Failed to fetch leave data", error);
    }
  }, [id, token]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  const handleAllocateLeave = async () => {
    if (!selectedLeaveType || !leaveCount || !validityDays || !token || !id) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    const days = parseInt(leaveCount);
    if (isNaN(days) || days <= 0) {
      toast({
        title: "Error",
        description: "Number of days must be a positive number",
        variant: "destructive",
      });
      return;
    }

    const validity = parseInt(validityDays);

    setIsAllocating(true);
    try {
      const res = await apiRequest<{ success: boolean; message: string; expiryDate?: string }>("/api/leave/allocate-individual", {
        method: "POST",
        token,
        body: {
          userId: id,
          leaveTypeId: selectedLeaveType,
          allocatedDays: days,
          validityDays: validity,
        },
      });

      if (res.success) {
        toast({
          title: "Leave Allocated",
          description: res.message || "Leave allocated successfully",
        });
        setIsAllocateDialogOpen(false);
        setSelectedLeaveType("");
        setLeaveCount("");
        setValidityDays("30");
        fetchLeaveData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to allocate leave",
        variant: "destructive",
      });
    } finally {
      setIsAllocating(false);
    }
  };

  // Calculate default 30 days range
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const todayStr = today.toISOString().split("T")[0];
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use employee's creation date as the minimum possible date for attendance
  const accountCreatedAt = employee?.createdAt ? new Date(employee.createdAt) : new Date("2024-01-01");
  const accountCreatedAtStr = accountCreatedAt.toISOString().split("T")[0];

  useEffect(() => {
    if (employee?.createdAt) {
      const createdAt = new Date(employee.createdAt);
      const createdAtStr = createdAt.toISOString().split("T")[0];
      
      // If 30 days ago is before creation date, set start date to creation date
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      if (thirtyDaysAgo < createdAt) {
        setStartDate(createdAtStr);
      }
    }
  }, [employee]);

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
      case "Checked In":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Checked In</Badge>;
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

  const fetchEmployee = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/employees/${id}`, {
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
    setAttendanceLoading(true);
    try {
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
        `${API_BASE_URL}/api/admin/attendance?${attendanceParams.toString()}`,
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
    } catch (err) {
      console.error("Attendance fetch error:", err);
      setAttendanceRecords([]);
    }

    try {
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
        `${API_BASE_URL}/api/admin/leave-requests?${leaveParams.toString()}`,
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
    } catch (err) {
      console.error("Leave fetch error:", err);
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
        weekOffDays: 0,
        totalWorkingHoursLabel: "0h 0m",
      };
    }

    const attendanceByDate = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach((record) => {
      if (record.date) {
        // record.date is YYYY-MM-DD from backend
        attendanceByDate.set(record.date, record);
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
        const key = format(current, "yyyy-MM-dd");
        leaveDates.add(key);
        current.setDate(current.getDate() + 1);
      }
    });

    const start = new Date(startDate);
    const end = new Date(endDate);

    let present = 0;
    let leave = 0;
    let absent = 0;
    let weekOff = 0;

    const cursor = new Date(start);
    while (cursor <= end) {
      const day = cursor.getDay();
      const key = format(cursor, "yyyy-MM-dd");
      
      if (attendanceByDate.has(key)) {
        present += 1;
      } else if (day === 0 || day === 6) {
        weekOff += 1;
      } else if (leaveDates.has(key)) {
        leave += 1;
      } else {
        absent += 1;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    let totalWorkingHours = 0;
    attendanceRecords.forEach((record) => {
      let workingHours = record.workingHours || 0;

      // Calculate live hours if currently checked in
      if (record.status === "checked-in" || (record.checkInTime && (!record.checkOutTime || record.checkOutTime === "-"))) {
        const checkInDate = new Date(record.checkInTime || "");
        if (!Number.isNaN(checkInDate.getTime())) {
          const now = new Date();
          const diff = (now.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
          workingHours = Math.max(0, diff);
        }
      }

      if (typeof workingHours === "number") {
        totalWorkingHours += workingHours;
      }
    });
    const wholeHours = Math.floor(totalWorkingHours);
    const minutes = Math.round((totalWorkingHours - wholeHours) * 60);
    const totalWorkingHoursLabel = `${wholeHours}h ${minutes}m`;

    return {
      presentDays: present,
      leaveDays: leave,
      absentDays: absent,
      weekOffDays: weekOff,
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
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
        }

        let checkOut = "-";
        if (record.checkOutTime) {
          const d = new Date(record.checkOutTime);
          checkOut = Number.isNaN(d.getTime())
            ? record.checkOutTime
            : d.toLocaleTimeString("en-IN", {
                hour12: true,
                hour: "2-digit",
                minute: "2-digit",
              });
        }

        let totalHours = "0h 0m";
        let workingHours = record.workingHours || 0;

        // Calculate live hours if currently checked in
        if (record.status === "checked-in" || (record.checkInTime && !record.checkOutTime)) {
          const checkInDate = new Date(record.checkInTime || "");
          if (!Number.isNaN(checkInDate.getTime())) {
            const now = new Date();
            const diff = (now.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
            workingHours = Math.max(0, diff);
          }
        }

        if (typeof workingHours === "number") {
          const h = Math.floor(workingHours);
          const m = Math.round((workingHours - h) * 60);
          totalHours = `${h}h ${m}m`;
        }

        const workMode = record.workMode || "-";
        
        // Accurate status detection: if check-out is missing or status is explicitly checked-in
        const isActive = record.status === "checked-in" || !record.checkOutTime || record.checkOutTime === "";
        const status: DayStatus = isActive ? "Checked In" : "Present";

        return {
          id: record._id,
          dateLabel,
          checkIn,
          checkOut,
          totalHours,
          workMode,
          status,
        };
      });
    }

    const attendanceByDate = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach((record) => {
      if (!record.date) {
        return;
      }
      attendanceByDate.set(record.date, record);
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
        const key = format(current, "yyyy-MM-dd");
        leaveDates.add(key);
        current.setDate(current.getDate() + 1);
      }
    });

    const rows: {
      id: string;
      dateLabel: string;
      checkIn: string;
      checkOut: string;
      totalHours: string;
      workMode: string;
      status: DayStatus;
    }[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const cursor = new Date(start);

    while (cursor <= end) {
      const key = format(cursor, "yyyy-MM-dd");
      const day = cursor.getDay();
      const record = attendanceByDate.get(key);

      if (record) {
        const dateLabel = key; // date is already YYYY-MM-DD

        let checkIn = "-";
        if (record.checkInTime) {
          const d = new Date(record.checkInTime);
          checkIn = Number.isNaN(d.getTime())
            ? record.checkInTime
            : d.toLocaleTimeString("en-IN", {
                hour12: true,
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
                hour12: true,
                hour: "2-digit",
                minute: "2-digit",
              });
        }

        let totalHours = "0h 0m";
        let workingHours = record.workingHours || 0;

        // Calculate live hours if currently checked in
        const isActive = record.status === "checked-in" || !record.checkOutTime || record.checkOutTime === "";
        if (isActive) {
          const checkInDate = new Date(record.checkInTime || "");
          if (!Number.isNaN(checkInDate.getTime())) {
            const now = new Date();
            const diff = (now.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
            workingHours = Math.max(0, diff);
          }
        }

        if (typeof workingHours === "number") {
          const h = Math.floor(workingHours);
          const m = Math.round((workingHours - h) * 60);
          totalHours = `${h}h ${m}m`;
        }

        const status: DayStatus = isActive ? "Checked In" : "Present";

        rows.push({
          id: record._id,
          dateLabel,
          checkIn,
          checkOut,
          totalHours,
          workMode: record.workMode || "-",
          status,
        });
      } else {
        const dateLabel = format(cursor, "yyyy-MM-dd");
        let status: DayStatus = "Absent";
        if (day === 0 || day === 6) status = "Week Off";
        else if (leaveDates.has(key)) status = "Leave";

        rows.push({
          id: key,
          dateLabel,
          checkIn: "-",
          checkOut: "-",
          totalHours: "0h 0m",
          workMode: "-",
          status,
        });
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    // Sort to show latest data on top
    return rows.sort((a, b) => b.dateLabel.localeCompare(a.dateLabel));
  }, [attendanceRecords, leaveRecords, startDate, endDate]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return formattedAttendanceRows.slice(start, start + itemsPerPage);
  }, [formattedAttendanceRows, currentPage]);

  const totalPages = Math.ceil(formattedAttendanceRows.length / itemsPerPage);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-10 w-10 border shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold truncate">
                  Employee Attendance
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Detailed attendance and leave summary for this employee.
                </p>
              </div>
            </div>

            <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Allocate Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Palmtree className="h-5 w-5 text-primary" />
                    Allocate Extra Leave
                  </DialogTitle>
                  <DialogDescription>
                    Manually add leave balance for {employee?.name}. The leave will be valid for the allocated number of days from today and will automatically expire after that period.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type._id} value={type._id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="count">Number of Days</Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      placeholder="e.g. 2"
                      value={leaveCount}
                      onChange={(e) => setLeaveCount(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="validity">Leave Validity</Label>
                    <Select value={validityDays} onValueChange={setValidityDays}>
                      <SelectTrigger id="validity">
                        <SelectValue placeholder="Select validity" />
                      </SelectTrigger>
                      <SelectContent>
                        {VALIDITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      ⏱ Expires on:{" "}
                      <span className="font-medium text-foreground">
                        {new Date(Date.now() + parseInt(validityDays) * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAllocateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAllocateLeave} disabled={isAllocating}>
                    {isAllocating ? "Allocating..." : "Confirm Allocation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

      

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border shadow-sm bg-card overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dayCounts.presentDays}</div>
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
                <div className="text-2xl font-bold">{dayCounts.absentDays}</div>
                <p className="text-xs text-muted-foreground mt-1">Days not marked</p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-card overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Leaves</CardTitle>
                <Palmtree className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dayCounts.leaveDays}</div>
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
                <div className="text-2xl font-bold">{dayCounts.totalWorkingHoursLabel}</div>
                <p className="text-xs text-muted-foreground mt-1">Total work time</p>
              </CardContent>
            </Card>
          </div>
          
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
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                      value={startDate}
                      min={accountCreatedAtStr}
                      max={todayStr}
                      onChange={(e) => setStartDate(e.target.value)}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker();
                        } catch (err) {
                          console.debug("showPicker not supported", err);
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
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                      value={endDate}
                      min={accountCreatedAtStr}
                      max={todayStr}
                      onChange={(e) => setEndDate(e.target.value)}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker();
                        } catch (err) {
                          console.debug("showPicker not supported", err);
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
                      if (!startDate || !endDate) {
                        toast({
                          title: "Warning",
                          description: "Please select both start and end dates.",
                          variant: "destructive",
                        });
                        return;
                      }
                      if (startDate < accountCreatedAtStr) {
                        toast({
                          title: "Warning",
                          description: `Start date cannot be before account creation date (${accountCreatedAtStr}).`,
                          variant: "destructive",
                        });
                        return;
                      }
                      fetchAttendanceAndLeaves();
                      setCurrentPage(1);
                    }}
                  >
                    Apply Filter
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-[42px] w-[42px] border-border hover:bg-muted"
                    onClick={() => {
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(today.getDate() - 30);
                      const tStr = thirtyDaysAgo < accountCreatedAt ? accountCreatedAtStr : thirtyDaysAgo.toISOString().split("T")[0];
                      setStartDate(tStr);
                      setEndDate(todayStr);
                      setCurrentPage(1);
                    }}
                    title="Reset Filters"
                  >
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card overflow-hidden">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">Attendance Details</CardTitle>
                <CardDescription>
                  Daily attendance records for the selected date range.
                </CardDescription>
              </div>
              <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {formattedAttendanceRows.length} Records
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-foreground text-center">Date</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">Check-In</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">Check-Out</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">Total Hours</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">Work Mode</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-muted-foreground font-medium">Fetching records...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : formattedAttendanceRows.length === 0 ? (
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
                        <TableRow
                          key={row.id}
                          className="hover:bg-muted/30 transition-colors border-b last:border-0"
                        >
                          <TableCell className="font-medium text-foreground text-center">
                            {new Date(row.dateLabel).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Clock className="h-3.5 w-3.5 opacity-60" />
                              {row.checkIn}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Clock className="h-3.5 w-3.5 opacity-60" />
                              {row.checkOut}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-foreground text-xs font-semibold">
                              {row.totalHours}
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
                          <TableCell className="text-center">
                            {getStatusBadge(row.status)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {!attendanceLoading && formattedAttendanceRows.length > 0 && (
                <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span> to{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(currentPage * itemsPerPage, formattedAttendanceRows.length)}
                    </span> of{" "}
                    <span className="font-semibold text-foreground">{formattedAttendanceRows.length}</span> records
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className={`h-8 w-8 p-0 ${currentPage === pageNum ? "shadow-sm" : ""}`}
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
                      disabled={currentPage === totalPages}
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
      </div>
    </div>
  );
};
