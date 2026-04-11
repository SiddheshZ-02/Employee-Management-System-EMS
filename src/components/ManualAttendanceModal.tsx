import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Briefcase,
  Home,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { API_BASE_URL } from "@/constant/Config";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/useAppSelector";

interface ManualAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  accountCreatedAt: string;
  todayStr: string;
}

const ManualAttendanceModal = ({
  open,
  onOpenChange,
  onSuccess,
  accountCreatedAt,
  todayStr,
}: ManualAttendanceModalProps) => {
  const { token } = useAppSelector((state) => state.auth);
  const [date, setDate] = useState(todayStr);
  const [workMode, setWorkMode] = useState("");
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("18:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [includeCheckout, setIncludeCheckout] = useState(true);
  const [workingHours, setWorkingHours] = useState("");

  useEffect(() => {
    if (includeCheckout && checkInTime && checkOutTime) {
      const [inHours, inMinutes] = checkInTime.split(":").map(Number);
      const [outHours, outMinutes] = checkOutTime.split(":").map(Number);

      const checkInMinutes = inHours * 60 + inMinutes;
      const checkOutMinutes = outHours * 60 + outMinutes;

      if (checkOutMinutes <= checkInMinutes) {
        setWorkingHours("Invalid: Check-out must be after check-in");
      } else {
        const diffMinutes = checkOutMinutes - checkInMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        setWorkingHours(`${hours}h ${minutes}m`);
      }
    } else {
      setWorkingHours("");
    }
  }, [checkInTime, checkOutTime, includeCheckout]);

  const resetForm = () => {
    setDate(todayStr);
    setWorkMode("");
    setCheckInTime("09:00");
    setCheckOutTime("18:00");
    setNotes("");
    setIncludeCheckout(true);
    setWorkingHours("");
  };

  const handleSubmit = async () => {
    if (!date) {
      toast.error("Please select a date.");
      return;
    }

    if (!workMode) {
      toast.error("Please select a work mode.");
      return;
    }

    if (!checkInTime) {
      toast.error("Please enter check-in time.");
      return;
    }

    if (includeCheckout && checkOutTime) {
      const [inHours, inMinutes] = checkInTime.split(":").map(Number);
      const [outHours, outMinutes] = checkOutTime.split(":").map(Number);

      const checkInMinutes = inHours * 60 + inMinutes;
      const checkOutMinutes = outHours * 60 + outMinutes;

      if (checkOutMinutes <= checkInMinutes) {
        toast.error("Check-out time must be after check-in time.");
        return;
      }
    }

    if (!token) {
      toast.error("Authentication required. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        date,
        workMode,
        checkInTime,
      };

      if (includeCheckout && checkOutTime) {
        payload.checkOutTime = checkOutTime;
      }

      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      const response = await fetch(
        `${API_BASE_URL}/api/attendance/manual-entry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add manual attendance");
      }

      toast.success(data.message || "Manual attendance added successfully!");
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add manual attendance";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Manual Attendance Entry
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add attendance record for a specific date. Fill in the details
            below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Date Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground cursor-pointer"
                value={date}
                min={accountCreatedAt}
                max={todayStr}
                onChange={(e) => setDate(e.target.value)}
                onClick={(e) => {
                  try {
                    (e.target as HTMLInputElement).showPicker();
                  } catch (err) {
                    console.debug("Date picker not supported", err);
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Select the date for which you want to add attendance
            </p>
          </div>

          {/* Work Mode Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Work Mode <span className="text-destructive">*</span>
            </label>
            <Select value={workMode} onValueChange={setWorkMode}>
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="Office" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Office</span>
                  </div>
                </SelectItem>
                <SelectItem value="WFH" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Work From Home</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Check-in Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Check-in Time <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="time"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground cursor-pointer"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  onClick={(e) => {
                    try {
                      (e.target as HTMLInputElement).showPicker();
                    } catch (err) {
                      console.debug("Time picker not supported", err);
                    }
                  }}
                />
              </div>
            </div>

            {/* Check-out Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Check-out Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="time"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  disabled={!includeCheckout}
                  onClick={(e) => {
                    if (!includeCheckout) return;
                    try {
                      (e.target as HTMLInputElement).showPicker();
                    } catch (err) {
                      console.debug("Time picker not supported", err);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Include Check-out Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeCheckout"
              checked={includeCheckout}
              onChange={(e) => setIncludeCheckout(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <label
              htmlFor="includeCheckout"
              className="text-sm text-foreground cursor-pointer"
            >
              Include check-out time
            </label>
          </div>

          {/* Working Hours Preview */}
          {workingHours && (
            <div
              className={`p-3 rounded-lg border ${
                workingHours.includes("Invalid")
                  ? "bg-destructive/10 border-destructive/20"
                  : "bg-primary/5 border-primary/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Expected Working Hours:
                </span>
                <Badge
                  variant="outline"
                  className={`font-semibold ${
                    workingHours.includes("Invalid")
                      ? "text-destructive border-destructive/30"
                      : "text-primary border-primary/30"
                  }`}
                >
                  {workingHours}
                </Badge>
              </div>
            </div>
          )}

          {/* Notes Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Notes{" "}
              <span className="text-muted-foreground font-normal">
                (Optional)
              </span>
            </label>
            <textarea
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground resize-none"
              rows={3}
              placeholder="Add a reason or note for this manual entry..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Explain why this manual entry is needed
              </p>
              <p className="text-xs text-muted-foreground">
                {notes.length}/500
              </p>
            </div>
          </div>

          {/* Warning Notice */}
      
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !date || !workMode || !checkInTime}
            className="flex-1 sm:flex-none px-6"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>Submit Attendance</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Building icon component
const Building = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

export default ManualAttendanceModal;