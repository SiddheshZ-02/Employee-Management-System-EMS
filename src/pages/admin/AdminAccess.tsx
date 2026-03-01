import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export const AdminAccess = () => {
  const { token } = useAppSelector((state) => state.auth);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!token) {
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/admin/weekoff`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          return;
        }
        const data: { success?: boolean; config?: { daysOfWeek?: number[] } } = await res.json();
        if (data.success && data.config && Array.isArray(data.config.daysOfWeek)) {
          setSelectedDays(
            data.config.daysOfWeek
              .map((d) => Number(d))
              .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [token]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!token) {
      toast({
        title: "Not authenticated",
        description: "Please log in again as admin.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/weekoff`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ daysOfWeek: selectedDays }),
      });
      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to update week off configuration.",
          variant: "destructive",
        });
        return;
      }
      const data: { success?: boolean } = await res.json();
      if (!data.success) {
        toast({
          title: "Error",
          description: "Unexpected response while updating configuration.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Saved",
        description: "Week off configuration updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Network error while saving configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Admin Access</h2>
              <p className="text-muted-foreground">
                Configure company-wide weekly off days for attendance.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Weekly Off Days</CardTitle>
              <CardDescription>
                Select which days of the week are considered week off for all employees.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-6 text-sm text-muted-foreground">Loading configuration...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {weekdayOptions.map((day) => {
                      const active = selectedDays.includes(day.value);
                      return (
                        <Button
                          key={day.value}
                          type="button"
                          variant={active ? "default" : "outline"}
                          className="justify-center"
                          onClick={() => toggleDay(day.value)}
                        >
                          {day.label}
                        </Button>
                      );
                    })}
                  </div>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

