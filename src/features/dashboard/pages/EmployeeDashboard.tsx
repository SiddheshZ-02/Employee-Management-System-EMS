import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setHolidays } from "@/features/holidays/store/holidaySlice";
import { setEmployees } from "@/features/employees/store/employeeSlice";
import {
  Clock,
  Calendar,
  User,
  CheckCircle,
  TrendingUp,
  Cake,
  Sparkles,
  Calendar as CalendarIcon,
  MapPin,
  Home,
  Building2,
  Loader2,
  RefreshCw,
  ShieldAlert,
  LogIn,
  LogOut,
} from "lucide-react";
import { API_BASE_URL } from "@/constants/config";
import { UpcomingHolidaysWidget } from "@/features/holidays/components/UpcomingHolidaysWidget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
} from "recharts";

const LIGHT_COLORS = [
  "bg-amber-50 border-amber-100 text-amber-700",
  "bg-cyan-50 border-cyan-100 text-cyan-700",
  "bg-indigo-50 border-indigo-100 text-indigo-700",
  "bg-purple-50 border-purple-100 text-purple-700",
  "bg-emerald-50 border-emerald-100 text-emerald-700",
  "bg-rose-50 border-rose-100 text-rose-700",
  "bg-blue-50 border-blue-100 text-blue-700",
];

const getPastelColor = (index: number) =>
  LIGHT_COLORS[index % LIGHT_COLORS.length];

type AttendanceStatus = "idle" | "checked-in" | "checked-out";
type WorkMode = "Office" | "WFH";
type LocationPermission = "unknown" | "granted" | "denied";

interface BackendEmployee {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  position?: string;
  department?: string;
  createdAt?: string;
  isActive?: boolean;
  dateOfBirth?: string;
}

export const EmployeeDashboard = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const { employees } = useAppSelector((state) => state.employees);
  const dispatch = useAppDispatch();
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<any[]>([]);

  const [hoursToday, setHoursToday] = useState("0h 0m");
  const [attendanceStatus, setAttendanceStatus] =
    useState<AttendanceStatus>("idle");
  const [todayAttendance, setTodayAttendance] = useState<any | null>(null);
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode>("Office");
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [monthAttendance, setMonthAttendance] = useState<{
    attended: number;
    totalDays: number;
  }>({
    attended: 0,
    totalDays: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);

  // --- Location permission gating for the attendance card ---
  const [locationPermission, setLocationPermission] =
    useState<LocationPermission>("unknown");
  const [isCheckingLocationPermission, setIsCheckingLocationPermission] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkExistingPermission = async () => {
      try {
        if (
          typeof navigator !== "undefined" &&
          (navigator as any).permissions?.query
        ) {
          const status = await (navigator as any).permissions.query({
            name: "geolocation",
          });
          if (!cancelled) {
            if (status.state === "granted") setLocationPermission("granted");
            else if (status.state === "denied") setLocationPermission("denied");
            else setLocationPermission("unknown");

            status.onchange = () => {
              if (status.state === "granted") setLocationPermission("granted");
              else if (status.state === "denied")
                setLocationPermission("denied");
              else setLocationPermission("unknown");
            };
          }
        }
      } catch {
        // Permissions API not supported (e.g. Safari) — fall back to "unknown"
        // and let the user trigger the browser prompt via the button.
      } finally {
        if (!cancelled) setIsCheckingLocationPermission(false);
      }
    };

    checkExistingPermission();

    // Re-check whenever the user comes back to this tab/page (not just on
    // a hard reload) so a permission change made elsewhere is reflected.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkExistingPermission();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    const today = new Date();
    return activities.filter((activity) => {
      const activityDate = new Date(activity.timestamp || activity.createdAt);
      const isToday = isSameDay(activityDate, today);
      const activityType = String(activity.type).trim();
      const isCorrectType = [
        "check-in",
        "check-out",
        "leave-approved",
        "profile-update",
      ].includes(activityType);
      return isToday && isCorrectType;
    });
  }, [activities]);

  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [holidays, setHolidaysState] = useState<any[]>([]);

  // Office location + distance state
  const [officeLocations, setOfficeLocations] = useState<any[]>([]);
  const [nearestOffice, setNearestOffice] = useState<any | null>(null);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const [isWithinOfficeRadius, setIsWithinOfficeRadius] = useState<
    boolean | null
  >(null);
  const [wfhDistance, setWfhDistance] = useState<number | null>(null);
  const [wfhAllowedRadius, setWfhAllowedRadius] = useState<number | null>(null);
  const [isReloadingDistance, setIsReloadingDistance] = useState(false);

  const getCurrentLocation = useCallback(() => {
    return new Promise<{ latitude: number; longitude: number }>(
      (resolve, reject) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          reject(new Error("Geolocation is not supported in this browser."));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        );
      },
    );
  }, []);

  const calculateDistanceMeters = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const R = 6371000; // metres
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [],
  );

  const computeNearestOffice = useCallback(
    (loc: { latitude: number; longitude: number }) => {
      if (!officeLocations || officeLocations.length === 0) return;

      let nearest: any = null;
      let nearestDist = Infinity;

      for (const office of officeLocations) {
        const officeLat = office.location?.coordinates
          ? office.location.coordinates[1]
          : undefined;
        const officeLng = office.location?.coordinates
          ? office.location.coordinates[0]
          : undefined;

        if (officeLat === undefined || officeLng === undefined) continue;

        const dist = calculateDistanceMeters(
          loc.latitude,
          loc.longitude,
          officeLat,
          officeLng,
        );

        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = office;
        }
      }

      if (nearest) {
        setNearestOffice(nearest);
        setNearestDistance(Math.round(nearestDist));
        setIsWithinOfficeRadius(nearestDist <= (nearest.radius || 0));
      }
    },
    [officeLocations, calculateDistanceMeters],
  );

  const requestLocationPermission = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationPermission("denied");
      return;
    }
    setIsCheckingLocationPermission(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission("granted");
        setIsCheckingLocationPermission(false);
        try {
          computeNearestOffice({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        } catch {
          // ignore
        }
      },
      () => {
        setLocationPermission("denied");
        setIsCheckingLocationPermission(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, [computeNearestOffice]);

  // When user selects Office mode and permission + office list available,
  // compute distance proactively so user can see whether inside radius before check-in.
  useEffect(() => {
    if (
      selectedWorkMode === "Office" &&
      locationPermission === "granted" &&
      officeLocations.length > 0
    ) {
      (async () => {
        try {
          const loc = await getCurrentLocation();
          computeNearestOffice(loc);
        } catch {
          // ignore
        }
      })();
    }
  }, [
    selectedWorkMode,
    locationPermission,
    officeLocations,
    getCurrentLocation,
    computeNearestOffice,
  ]);

  // For WFH: compute distance after check-in so user sees how far they are from their check-in anchor
  useEffect(() => {
    if (!todayAttendance || todayAttendance.workMode !== "WFH") return;

    const allowed = todayAttendance.wfhCheckoutRadius || 100;
    setWfhAllowedRadius(allowed);

    (async () => {
      try {
        const loc = await getCurrentLocation();
        const checkInLat = todayAttendance.checkInLocation?.coordinates
          ? todayAttendance.checkInLocation.coordinates[1]
          : null;
        const checkInLng = todayAttendance.checkInLocation?.coordinates
          ? todayAttendance.checkInLocation.coordinates[0]
          : null;

        if (checkInLat !== null && checkInLng !== null) {
          const dist = calculateDistanceMeters(
            loc.latitude,
            loc.longitude,
            checkInLat,
            checkInLng,
          );
          setWfhDistance(Math.round(dist));
        }
      } catch {
        setWfhDistance(null);
      }
    })();
  }, [todayAttendance, getCurrentLocation, calculateDistanceMeters]);

  const reloadDistance = useCallback(async () => {
    if (!getCurrentLocation) return;
    setIsReloadingDistance(true);
    try {
      const loc = await getCurrentLocation();
      if (selectedWorkMode === "Office") {
        computeNearestOffice(loc);
      }

      if (
        selectedWorkMode === "WFH" &&
        todayAttendance &&
        todayAttendance.workMode === "WFH"
      ) {
        const checkInLat = todayAttendance.checkInLocation?.coordinates
          ? todayAttendance.checkInLocation.coordinates[1]
          : null;
        const checkInLng = todayAttendance.checkInLocation?.coordinates
          ? todayAttendance.checkInLocation.coordinates[0]
          : null;

        if (checkInLat !== null && checkInLng !== null) {
          const dist = calculateDistanceMeters(
            loc.latitude,
            loc.longitude,
            checkInLat,
            checkInLng,
          );
          setWfhDistance(Math.round(dist));
        }
      }
    } catch {
      // ignore
    } finally {
      setIsReloadingDistance(false);
    }
  }, [
    getCurrentLocation,
    selectedWorkMode,
    computeNearestOffice,
    todayAttendance,
    calculateDistanceMeters,
  ]);

  const handleAttendanceAction = useCallback(async () => {
    if (!token) {
      toast.error("Please sign in again to mark attendance.");
      return;
    }

    setIsSubmittingAttendance(true);

    try {
      const location = await getCurrentLocation();
      setLocationPermission("granted");
      const isCheckingOut = attendanceStatus === "checked-in";
      const endpoint = isCheckingOut ? "checkout" : "checkin";
      const payload: Record<string, unknown> = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      if (!isCheckingOut) {
        payload.workMode = selectedWorkMode;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/attendance/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update attendance right now.",
        );
      }

      setTodayAttendance(data.attendance || null);
      setAttendanceStatus(
        data.attendance?.status === "checked-out"
          ? "checked-out"
          : "checked-in",
      );
      setSelectedWorkMode(
        (data.attendance?.workMode as WorkMode) || selectedWorkMode,
      );
      setHoursToday(data.stats?.totalHours || "0h 0m");
      toast.success(data.message || "Attendance updated successfully.");
    } catch (error: any) {
      if (error?.code === 1) {
        // GeolocationPositionError.PERMISSION_DENIED
        setLocationPermission("denied");
      }
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update attendance right now.";
      toast.error(message);
    } finally {
      setIsSubmittingAttendance(false);
    }
  }, [attendanceStatus, getCurrentLocation, selectedWorkMode, token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    const loadData = async () => {
      try {
        const now = new Date();

        const responses = await Promise.allSettled([
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
          fetch(`${API_BASE_URL}/api/activity/recent?limit=20`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/holidays`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/auth/colleagues`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/auth/birthdays`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/leave/leave-cards-status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/attendance/office-location`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [
          todayRes,
          historyRes,
          leaveRes,
          balanceRes,
          activityRes,
          holidayRes,
          colleaguesRes,
          birthdaysRes,
          leaveCardsRes,
          officeRes,
        ] = responses.map((r) =>
          r.status === "fulfilled"
            ? r.value
            : ({ ok: false, json: () => Promise.resolve({}) } as any),
        );

        if (leaveCardsRes.ok) {
          const leaveCardsJson = await leaveCardsRes.json();
          if (leaveCardsJson.success) {
            const cards = leaveCardsJson.leaveCards || [];
            // Leave cards data fetched but not currently displayed

            if (balanceRes.ok) {
              const balanceJson = await balanceRes.json();
              if (balanceJson.success && Array.isArray(balanceJson.balances)) {
                const yearlyBalances = balanceJson.balances.filter(
                  (b: any) => !b.isAllocationBased,
                );

                const yearlyTotal = yearlyBalances.reduce(
                  (sum: number, b: any) => sum + (b.remainingDays || 0),
                  0,
                );

                const grantedTotal = cards.reduce(
                  (sum: number, card: any) => sum + (card.available_days || 0),
                  0,
                );

                setLeaveBalance(yearlyTotal + grantedTotal);
              }
            }
          }
        }

        if (colleaguesRes.ok) {
          const colleaguesJson = await colleaguesRes.json();
          if (
            colleaguesJson.success &&
            Array.isArray(colleaguesJson.employees)
          ) {
            const mappedEmployees = colleaguesJson.employees.map(
              (emp: BackendEmployee) => ({
                id: String(emp._id),
                name: String(emp.name),
                email: String(emp.email),
                employeeId: String(emp.employeeId || ""),
                position: String(emp.position || emp.employeeId || ""),
                department: String(emp.department || ""),
                joinDate: emp.createdAt
                  ? new Date(emp.createdAt).toISOString()
                  : new Date().toISOString(),
                status: emp.isActive === false ? "Inactive" : "Active",
                dateOfBirth: emp.dateOfBirth,
              }),
            );
            dispatch(setEmployees(mappedEmployees));
          }
        }

        if (birthdaysRes.ok) {
          const birthdaysJson = await birthdaysRes.json();
          if (birthdaysJson.success && Array.isArray(birthdaysJson.birthdays)) {
            setUpcomingBirthdays(birthdaysJson.birthdays);
          }
        }

        let currentWeekRecords = [];
        let currentLeaves = [];
        let currentHolidays = [];

        if (todayRes.ok) {
          const todayJson = await todayRes.json();
          if (todayJson.success) {
            setTodayAttendance(todayJson.attendance || null);
            if (todayJson.attendance?.status === "checked-in") {
              setAttendanceStatus("checked-in");
            } else if (todayJson.attendance?.status === "checked-out") {
              setAttendanceStatus("checked-out");
            } else {
              setAttendanceStatus("idle");
            }
            if (todayJson.attendance?.workMode) {
              setSelectedWorkMode(
                todayJson.attendance.workMode === "WFH" ? "WFH" : "Office",
              );
            }
            if (todayJson.stats && todayJson.stats.totalHours) {
              setHoursToday(todayJson.stats.totalHours);
            } else {
              setHoursToday("0h 0m");
            }
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

        // Office locations (for distance/radius display)
        if (officeRes && officeRes.ok) {
          const officeJson = await officeRes.json();
          if (officeJson.success && Array.isArray(officeJson.officeLocations)) {
            setOfficeLocations(officeJson.officeLocations);

            // If location permission already granted, compute nearest immediately
            if (locationPermission === "granted") {
              try {
                const loc = await getCurrentLocation();
                computeNearestOffice(loc);
              } catch {
                // ignore
              }
            }
          }
        }

        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const daysInWeek = eachDayOfInterval({
          start: weekStart,
          end: weekEnd,
        });

        const weeklyStats = daysInWeek.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const record = currentWeekRecords.find((r: any) => r.date === dayStr);
          const hours = record
            ? parseFloat((record.workingHours || 0).toFixed(1))
            : 0;

          let status = "none";
          const isHoliday = currentHolidays.some((h: any) => h.date === dayStr);
          const isLeave = currentLeaves.some(
            (l: any) =>
              l.status === "approved" &&
              dayStr >= format(parseISO(l.startDate), "yyyy-MM-dd") &&
              dayStr <= format(parseISO(l.endDate), "yyyy-MM-dd"),
          );
          const isWeekOff = day.getDay() === 0 || day.getDay() === 6;

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

        if (activityRes.ok) {
          const activityJson = await activityRes.json();
          if (activityJson.success && activityJson.activities) {
            setActivities(activityJson.activities);
          }
        }
      } catch {
        return;
      }
    };
    loadData();
  }, [token, dispatch]);

  // Periodic update for "Hours Today" and Activities
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      try {
        const [todayRes, historyRes, activityRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/attendance/today`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/attendance/history?period=month`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/activity/recent?limit=20`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (todayRes.ok) {
          const data = await todayRes.json();
          if (data.success) {
            setTodayAttendance(data.attendance || null);
            if (data.attendance?.status === "checked-in") {
              setAttendanceStatus("checked-in");
            } else if (data.attendance?.status === "checked-out") {
              setAttendanceStatus("checked-out");
            } else {
              setAttendanceStatus("idle");
            }
            if (data.attendance?.workMode) {
              setSelectedWorkMode(
                data.attendance.workMode === "WFH" ? "WFH" : "Office",
              );
            }
            if (data.stats && data.stats.totalHours) {
              setHoursToday(data.stats.totalHours);
            }
          }
        }

        if (historyRes.ok) {
          const historyJson = await historyRes.json();
          if (historyJson.success && historyJson.records) {
            const now = new Date();
            const weekStart = startOfWeek(now, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
            const daysInWeek = eachDayOfInterval({
              start: weekStart,
              end: weekEnd,
            });
            const weekRecords = historyJson.records || [];

            const weeklyStats = daysInWeek.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const record = weekRecords.find((r: any) => r.date === dayStr);
              const hours = record
                ? parseFloat((record.workingHours || 0).toFixed(1))
                : 0;

              // Determine status
              let status = "none";
              const isHoliday = holidays.some((h: any) => h.date === dayStr);
              const isLeave = leaves.some(
                (l: any) =>
                  l.status === "approved" &&
                  dayStr >= format(parseISO(l.startDate), "yyyy-MM-dd") &&
                  dayStr <= format(parseISO(l.endDate), "yyyy-MM-dd"),
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
    }, 30000); // refresh every 30 seconds

    return () => clearInterval(interval);
  }, [token, holidays, leaves]);

  const isLocationGranted = locationPermission === "granted";

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
                    Today's Activity
                  </CardTitle>
                  <div
                    className={`p-2 rounded-full ${
                      !filteredActivities[0]
                        ? "bg-muted/10"
                        : filteredActivities[0].type === "check-in"
                          ? "bg-green-500/10"
                          : filteredActivities[0].type === "check-out"
                            ? "bg-red-500/10"
                            : filteredActivities[0].type === "leave-approved"
                              ? "bg-purple-500/10"
                              : "bg-orange-500/10"
                    }`}
                  >
                    {!filteredActivities[0] ? (
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <>
                        {filteredActivities[0].type === "check-in" && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {filteredActivities[0].type === "check-out" && (
                          <Clock className="h-4 w-4 text-red-600" />
                        )}
                        {filteredActivities[0].type === "leave-approved" && (
                          <Calendar className="h-4 w-4 text-purple-600" />
                        )}
                        {filteredActivities[0].type === "profile-update" && (
                          <User className="h-4 w-4 text-blue-600" />
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredActivities[0] ? (
                    <>
                      <div
                        className={`text-2xl font-bold capitalize ${
                          filteredActivities[0].type === "check-in"
                            ? "text-green-600"
                            : filteredActivities[0].type === "check-out"
                              ? "text-red-600"
                              : filteredActivities[0].type === "leave-approved"
                                ? "text-purple-600"
                                : "text-orange-600"
                        }`}
                      >
                        {filteredActivities[0].type.replace("-", " ")}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="truncate font-medium">
                          {format(
                            new Date(
                              filteredActivities[0].timestamp ||
                                filteredActivities[0].createdAt,
                            ),
                            "hh:mm a",
                          )}
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-muted-foreground">
                        No Activity
                      </div>
                      <p className="text-xs text-muted-foreground">
                        No updates for today
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* --- Attendance Check-In: minimal, blurred + location-gated --- */}
          <div
            className="grid gap-6 lg:grid-cols-1 animate-fade-in"
            style={{ animationDelay: "150ms" }}
          >
            <Card className="relative hover-lift transition-smooth border-0 shadow-lg overflow-hidden bg-gradient-to-br from-card to-card/95">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <span>Attendance</span>
                  </CardTitle>
                  <Badge
                    className={
                      "transition-colors duration-300 " +
                      (attendanceStatus === "checked-in"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-slate-500 hover:bg-slate-600")
                    }
                  >
                    {attendanceStatus === "checked-in"
                      ? "Checked in"
                      : attendanceStatus === "checked-out"
                        ? "Checked out"
                        : "Not started"}
                  </Badge>
                </div>
              </CardHeader>

              {/* Content — blurred and inert until location permission is granted */}
              <CardContent
                className={
                  "space-y-4 transition-all duration-500 ease-out " +
                  (isLocationGranted
                    ? "blur-0 opacity-100"
                    : "blur-md opacity-70 select-none pointer-events-none")
                }
                aria-hidden={!isLocationGranted}
              >
                <div className="flex rounded-lg bg-muted p-1 text-sm max-w-xs">
                  {(["Office", "WFH"] as WorkMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedWorkMode(m)}
                      disabled={
                        isSubmittingAttendance ||
                        attendanceStatus === "checked-in"
                      }
                      className={
                        "flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors " +
                        (selectedWorkMode === m
                          ? "bg-background shadow-sm font-medium"
                          : "text-muted-foreground")
                      }
                    >
                      {m === "Office" ? (
                        <Building2 className="h-3.5 w-3.5" />
                      ) : (
                        <Home className="h-3.5 w-3.5" />
                      )}
                      {m === "Office" ? "Office" : "WFH"}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleAttendanceAction}
                  disabled={isSubmittingAttendance}
                  className={
                    "w-full sm:w-auto gap-2 " +
                    (attendanceStatus === "checked-in"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700")
                  }
                >
                  {isSubmittingAttendance ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : attendanceStatus === "checked-in" ? (
                    <LogOut className="h-4 w-4" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  {isSubmittingAttendance
                    ? attendanceStatus === "checked-in"
                      ? "Checking out…"
                      : "Checking in…"
                    : attendanceStatus === "checked-in"
                      ? "Check out"
                      : "Check in"}
                </Button>
                {isLocationGranted &&
                  selectedWorkMode === "Office" &&
                  nearestOffice && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">
                          Office check-in distance
                        </div>
                        <button
                          type="button"
                          onClick={reloadDistance}
                          disabled={isReloadingDistance}
                          aria-label="Refresh distance"
                          className="p-1 rounded hover:bg-muted/10 disabled:opacity-60"
                        >
                          {isReloadingDistance ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="mt-1">
                        {nearestDistance !== null ? (
                          <>
                            <span>{nearestDistance}m away</span>
                            <span className="mx-2">•</span>
                            <span>Radius {nearestOffice.radius || 0}m</span>
                            <span className="mx-2">•</span>
                            <span
                              className={
                                isWithinOfficeRadius
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {isWithinOfficeRadius
                                ? "Within radius"
                                : "Outside radius"}
                            </span>
                          </>
                        ) : (
                          <span>Distance: unavailable</span>
                        )}
                      </div>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={reloadDistance}
                          disabled={isReloadingDistance}
                          className="inline-flex items-center gap-2"
                        >
                          {isReloadingDistance ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Refresh distance"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                {isLocationGranted &&
                  selectedWorkMode === "WFH" &&
                  todayAttendance &&
                  todayAttendance.workMode === "WFH" && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">
                          WFH check-in distance
                        </div>
                        <button
                          type="button"
                          onClick={reloadDistance}
                          disabled={isReloadingDistance}
                          aria-label="Refresh distance"
                          className="p-1 rounded hover:bg-muted/10 disabled:opacity-60"
                        >
                          {isReloadingDistance ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="mt-1">
                        {wfhDistance !== null ? (
                          <>
                            <span>{wfhDistance}m away from check-in</span>
                            <span className="mx-2">•</span>
                            <span>Allowed radius {wfhAllowedRadius || 0}m</span>
                            <span className="mx-2">•</span>
                            <span
                              className={
                                wfhDistance !== null &&
                                wfhAllowedRadius !== null &&
                                wfhDistance <= wfhAllowedRadius
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {wfhDistance !== null &&
                              wfhAllowedRadius !== null &&
                              wfhDistance <= wfhAllowedRadius
                                ? "Within radius"
                                : "Outside radius"}
                            </span>
                          </>
                        ) : (
                          <span>Distance: unavailable</span>
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>

              {/* Overlay shown until location permission is granted */}
              {!isLocationGranted && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] animate-in fade-in duration-300">
                  <div
                    key={locationPermission}
                    className="flex flex-col items-center gap-3 px-6 text-center animate-in fade-in zoom-in-95 duration-300"
                  >
                    {locationPermission === "denied" ? (
                      <>
                        <div className="p-2 rounded-full bg-red-500/10">
                          <ShieldAlert className="h-5 w-5 text-red-500" />
                        </div>
                        <p className="text-sm text-muted-foreground max-w-[240px]">
                          Location access was denied. Enable it in your browser
                          settings, then try again.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="p-2 rounded-full bg-blue-500/10">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-sm text-muted-foreground max-w-[240px]">
                          Turn on location to check in or out.
                        </p>
                      </>
                    )}
                    <Button
                      size="sm"
                      onClick={requestLocationPermission}
                      disabled={isCheckingLocationPermission}
                      className="transition-transform active:scale-95"
                    >
                      {isCheckingLocationPermission ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Requesting…
                        </span>
                      ) : locationPermission === "denied" ? (
                        "Try again"
                      ) : (
                        "Allow location"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <UpcomingHolidaysWidget />

            <Card className="hover-lift transition-smooth border-0 shadow-lg overflow-hidden bg-gradient-to-br from-card to-card/95 flex flex-col h-[380px]">
              <CardHeader className="pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-4 rounded-full bg-pink-500/10">
                      <Cake className="h-6 w-6 text-pink-600" />
                    </div>
                    <span>Upcoming Birthdays</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 overflow-y-auto scrollbar-hide flex-1">
                {upcomingBirthdays.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBirthdays.map((emp, index) => {
                      const colorClasses = getPastelColor(index);
                      const isToday = emp.daysUntil === 0;

                      return (
                        <div
                          key={emp.id}
                          className={`group relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${colorClasses} animate-fade-in`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex flex-col items-center justify-center min-w-[50px] h-[54px] rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border-white/50 group-hover:bg-white transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                              {format(emp.birthdayDate!, "MMM")}
                            </span>
                            <span className="text-xl font-bold tracking-tight">
                              {format(emp.birthdayDate!, "dd")}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold truncate">
                                {emp.name}
                              </h4>
                              {isToday && (
                                <Badge className="bg-pink-500 hover:bg-pink-600 text-[10px] h-4 px-1.5 animate-pulse">
                                  TODAY
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center text-[11px] font-medium opacity-70">
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              {emp.department}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[10px] font-bold bg-white/40 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                              {emp.daysUntil === 0
                                ? "Today! 🎂"
                                : emp.daysUntil === 1
                                  ? "Tomorrow"
                                  : `In ${emp.daysUntil} days`}
                            </span>
                          </div>

                          {isToday && (
                            <div className="absolute -top-1 -right-1">
                              <Sparkles className="h-4 w-4 text-pink-500 animate-bounce" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 bg-pink-500/5 rounded-xl border border-dashed border-pink-500/20 h-full">
                    <div className="p-3 rounded-full bg-pink-500/10">
                      <Cake className="h-6 w-6 text-pink-500/40" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-pink-500/80">
                        {employees.length === 0
                          ? "No colleagues found"
                          : "No upcoming birthdays"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-1">
            <Card className="hover-lift transition-smooth border-0 shadow-lg overflow-hidden bg-gradient-to-br from-card to-card/95 flex flex-col h-[420px]">
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
                    {weeklyData
                      .reduce(
                        (sum, d) =>
                          sum + (d.status === "present" ? d.hours : 0),
                        0,
                      )
                      .toFixed(1)}
                    h
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total this week
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[280px] mt-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
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
                      cursor={{ fill: "rgba(0,0,0,0.02)" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const getStatusColor = (status: string) => {
                            switch (status) {
                              case "present":
                                return "bg-green-500";
                              case "leave":
                                return "bg-orange-500";
                              case "holiday":
                                return "bg-blue-500";
                              case "absent":
                                return "bg-red-500";
                              case "weekoff":
                                return "bg-yellow-500";
                              default:
                                return "bg-slate-300";
                            }
                          };
                          const getStatusText = (status: string) => {
                            switch (status) {
                              case "present":
                                return "Present";
                              case "leave":
                                return "On Leave";
                              case "holiday":
                                return "Holiday";
                              case "absent":
                                return "Absent";
                              case "weekoff":
                                return "Week Off";
                              default:
                                return "No Data";
                            }
                          };
                          return (
                            <div className="bg-white p-3 shadow-xl rounded-lg border border-slate-100 animate-in fade-in zoom-in duration-200">
                              <p className="text-xs font-semibold text-slate-500 mb-1">
                                {data.fullDate}
                              </p>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${getStatusColor(data.status)}`}
                                />
                                <p className="text-sm font-bold text-slate-900">
                                  {getStatusText(data.status)}
                                </p>
                              </div>
                              {data.status === "present" && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {data.displayHours} Working Hours
                                </p>
                              )}
                              {data.isToday && (
                                <p className="text-[10px] text-purple-600 font-medium mt-1">
                                  Today
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="hours"
                      radius={[6, 6, 0, 0]}
                      barSize={50}
                      minPointSize={6}
                    >
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
