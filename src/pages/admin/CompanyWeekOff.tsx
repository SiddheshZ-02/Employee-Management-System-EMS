import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Save,
  Loader2,
  Check,
  Settings2,
  ArrowLeft,
} from "lucide-react";
import { API_BASE_URL } from "@/constant/Config";
import { toast } from "@/hooks/use-toast";

const weekdayOptions = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export const CompanyWeekOff = () => {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);

  // Week Off State
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [weekOffLoading, setWeekOffLoading] = useState(false);
  const [savingWeekOff, setSavingWeekOff] = useState(false);

  // --- Week Off Handlers ---
  const fetchWeekOffConfig = useCallback(async () => {
    if (!token) return;
    try {
      setWeekOffLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/weekoff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (
        data.success &&
        data.config &&
        Array.isArray(data.config.daysOfWeek)
      ) {
        setSelectedDays(data.config.daysOfWeek.map(Number));
      }
    } finally {
      setWeekOffLoading(false);
    }
  }, [token]);

  const handleSaveWeekOff = async () => {
    if (!token) return;
    try {
      setSavingWeekOff(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/weekoff`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ daysOfWeek: selectedDays }),
      });
      if (res.ok) {
        toast({
          title: "Success",
          description: "Week off configuration updated.",
        });
      }
    } finally {
      setSavingWeekOff(false);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  useEffect(() => {
    fetchWeekOffConfig();
  }, [fetchWeekOffConfig]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-10 w-10 border shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Company Week Off
        </h2>
      </div>

      <Card className="border shadow-xl overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Working Schedule
          </CardTitle>
          <CardDescription className="text-sm">
            Define standard non-working days for all employees in the
            organization.
          </CardDescription>
        </div>
        <CardContent className="p-8">
          {weekOffLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
              <p className="text-sm text-muted-foreground">
                Loading configuration...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6">
              {weekdayOptions.map((day) => {
                const isActive = selectedDays.includes(day.value);
                return (
                  <div
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`
                      group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 select-none
                      ${
                        isActive
                          ? "border-primary bg-primary/5 shadow-md ring-4 ring-primary/10"
                          : "border-muted hover:border-primary/30 hover:bg-muted/30"
                      }
                    `}
                  >
                    <span
                      className={`text-xs font-black uppercase tracking-widest mb-3 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {day.label.substring(0, 3)}
                    </span>
                    <div
                      className={`
                      h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground scale-110"
                          : "bg-muted text-muted-foreground"
                      }
                    `}
                    >
                      {isActive ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/30 px-8 py-6 flex justify-between items-center border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings2 className="h-4 w-4" />
            {selectedDays.length} days selected as non-working
          </div>
          <Button
            onClick={handleSaveWeekOff}
            disabled={savingWeekOff}
            className="px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105"
          >
            {savingWeekOff ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
