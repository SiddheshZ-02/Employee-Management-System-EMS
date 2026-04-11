import { useState, useEffect } from "react";
import { Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { API_BASE_URL } from "@/constant/Config";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/useAppSelector";

interface QuickCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  attendanceData: {
    date: string;
    checkInTime: string;
    checkInLabel: string;
  } | null;
}

const QuickCheckoutModal = ({
  open,
  onOpenChange,
  onSuccess,
  attendanceData,
}: QuickCheckoutModalProps) => {
  const { token } = useAppSelector((state) => state.auth);
  const [checkOutTime, setCheckOutTime] = useState("18:00");
  const [loading, setLoading] = useState(false);
  const [workingHours, setWorkingHours] = useState("");

  useEffect(() => {
    if (attendanceData?.checkInTime && checkOutTime) {
      const checkInDate = new Date(attendanceData.checkInTime);
      const [outHours, outMinutes] = checkOutTime.split(":").map(Number);
      
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setHours(outHours, outMinutes, 0, 0);

      if (checkOutDate <= checkInDate) {
        setWorkingHours("Invalid: Must be after check-in");
      } else {
        const diffMs = checkOutDate.getTime() - checkInDate.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        setWorkingHours(`${hours}h ${minutes}m`);
      }
    } else {
      setWorkingHours("");
    }
  }, [checkOutTime, attendanceData?.checkInTime]);

  const handleSubmit = async () => {
    if (!attendanceData) {
      toast.error("No attendance data available.");
      return;
    }

    if (!checkOutTime) {
      toast.error("Please enter check-out time.");
      return;
    }

    const checkInDate = new Date(attendanceData.checkInTime);
    const [outHours, outMinutes] = checkOutTime.split(":").map(Number);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setHours(outHours, outMinutes, 0, 0);

    if (checkOutDate <= checkInDate) {
      toast.error("Check-out time must be after check-in time.");
      return;
    }

    if (!token) {
      toast.error("Authentication required. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/attendance/update-checkout`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: attendanceData.date,
            checkOutTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update check-out time");
      }

      toast.success(data.message || "Check-out time updated successfully!");
      setCheckOutTime("18:00");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update check-out time";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!attendanceData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-background border-border">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Update Check-Out Time
          </DialogTitle>
          <DialogDescription className="text-sm">
            {new Date(attendanceData.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Info Row */}
          <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-md">
            <span className="text-muted-foreground">Check-in</span>
            <Badge variant="outline" className="text-xs font-medium">
              {attendanceData.checkInLabel}
            </Badge>
          </div>

          {/* Check-out Time Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Check-out Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="time"
                className="w-full bg-background border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground cursor-pointer"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
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

          {/* Working Hours Preview */}
          {workingHours && (
            <div
              className={`flex items-center justify-between text-sm p-3 rounded-md border ${
                workingHours.includes("Invalid")
                  ? "bg-destructive/10 border-destructive/20"
                  : "bg-primary/5 border-primary/20"
              }`}
            >
              <span className="text-muted-foreground">Total Hours</span>
              <span
                className={`font-semibold text-sm ${
                  workingHours.includes("Invalid")
                    ? "text-destructive"
                    : "text-primary"
                }`}
              >
                {workingHours}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 sm:flex-none h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !checkOutTime}
            className="flex-1 sm:flex-none h-9 px-4"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Update
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickCheckoutModal;