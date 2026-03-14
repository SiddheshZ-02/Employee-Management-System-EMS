import { useEffect, useCallback, useMemo, useState } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { format, parseISO, isPast, startOfDay } from "date-fns";
import {
  setHolidays,
  addHoliday,
  updateHolidayInState,
  removeHoliday,
  setLoading as setHolidayLoading,
  setError as setHolidayError,
  type Holiday,
} from "@/store/slices/holidaySlice";

const HOLIDAY_COLORS = [
  {
    bg: "bg-blue-500/10",
    title: "text-blue-600 dark:text-blue-600",
    badge: "bg-blue-600",
  },
  {
    bg: "bg-purple-500/10",
    title: "text-purple-600 dark:text-purple-600",
    badge: "bg-purple-600",
  },
  {
    bg: "bg-orange-500/10",
    title: "text-orange-600 dark:text-orange-600",
    badge: "bg-orange-600",
  },
  {
    bg: "bg-rose-500/10",
    title: "text-rose-600 dark:text-rose-600",
    badge: "bg-rose-600",
  },
  {
    bg: "bg-indigo-500/10",
    title: "text-indigo-600 dark:text-indigo-600",
    badge: "bg-indigo-600",
  },
  {
    bg: "bg-cyan-500/10",
    title: "text-cyan-600 dark:text-cyan-600",
    badge: "bg-cyan-600",
  },
  {
    bg: "bg-amber-500/10",
    title: "text-amber-600 dark:text-amber-600",
    badge: "bg-amber-600",
  },
  {
    bg: "bg-teal-500/10",
    title: "text-teal-600 dark:text-teal-600",
    badge: "bg-teal-600",
  },
  {
    bg: "bg-pink-500/10",
    title: "text-pink-600 dark:text-pink-600",
    badge: "bg-pink-600",
  },
];

const getHolidayColor = (index: number) => {
  return HOLIDAY_COLORS[index % HOLIDAY_COLORS.length];
};

export const CompanyHolidays = () => {
  const { token } = useAppSelector((state) => state.auth);
  const { holidays, loading: holidayLoading } = useAppSelector(
    (state) => state.holiday
  );
  const dispatch = useAppDispatch();

  // Holiday State
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);
  const [deletingHoliday, setDeletingHoliday] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: "",
  });

  const fetchHolidays = useCallback(async () => {
    if (!token) return;
    dispatch(setHolidayLoading(true));
    try {
      const data = await apiRequest<{ success: boolean; holidays: Holiday[] }>(
        "/api/admin/holidays",
        {
          token,
        }
      );
      if (data.success) {
        dispatch(setHolidays(data.holidays));
      }
    } catch (err: any) {
      dispatch(setHolidayError(err.message));
    }
  }, [token, dispatch]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleOpenHolidayDialog = (holiday: Holiday | null = null) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setHolidayForm({
        name: holiday.name,
        date: holiday.date,
      });
    } else {
      setEditingHoliday(null);
      setHolidayForm({
        name: "",
        date: "",
      });
    }
    setIsHolidayDialogOpen(true);
  };

  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const selectedDate = parseISO(holidayForm.date);
    if (
      isPast(selectedDate) &&
      startOfDay(selectedDate) < startOfDay(new Date())
    ) {
      if (!window.confirm("This date is in the past. Proceed?")) return;
    }

    if (
      holidays.some(
        (h) =>
          h.date === holidayForm.date &&
          (!editingHoliday || h._id !== editingHoliday._id)
      )
    ) {
      toast({
        title: "Error",
        description: "Holiday already exists on this date.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...holidayForm,
      };

      if (editingHoliday) {
        const data = await apiRequest<{ success: boolean; holiday: Holiday }>(
          `/api/admin/holidays/${editingHoliday._id}`,
          {
            method: "PUT",
            body: payload,
            token,
          }
        );
        if (data.success) dispatch(updateHolidayInState(data.holiday));
      } else {
        const data = await apiRequest<{ success: boolean; holiday: Holiday }>(
          "/api/admin/holidays",
          {
            method: "POST",
            body: payload,
            token,
          }
        );
        if (data.success) dispatch(addHoliday(data.holiday));
      }
      setIsHolidayDialogOpen(false);
      toast({
        title: "Success",
        description: `Holiday ${
          editingHoliday ? "updated" : "added"
        } successfully.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidayToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteHoliday = async () => {
    if (!token || !holidayToDelete) return;
    try {
      setDeletingHoliday(true);
      const data = await apiRequest<{ success: boolean }>(
        `/api/admin/holidays/${holidayToDelete}`,
        {
          method: "DELETE",
          token,
        }
      );
      if (data.success) {
        dispatch(removeHoliday(holidayToDelete));
        toast({
          title: "Deleted",
          description: "Holiday removed successfully.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeletingHoliday(false);
      setIsDeleteDialogOpen(false);
      setHolidayToDelete(null);
    }
  };

  const groupedHolidays = useMemo(() => {
    const groups: Record<string, Holiday[]> = {};
    holidays.forEach((h) => {
      const monthYear = format(parseISO(h.date), "MMMM yyyy");
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(h);
    });
    return groups;
  }, [holidays]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Holiday Calendar
            </h2>
            <p className="text-muted-foreground">
              Schedule upcoming company-wide holidays and observances.
            </p>
          </div>
          <Button
            onClick={() => handleOpenHolidayDialog()}
            className="shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Holiday
          </Button>
        </div>

        {holidayLoading && holidays.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
            <p className="text-muted-foreground font-medium">
              Fetching your holiday list...
            </p>
          </div>
        ) : holidays.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-20 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <CalendarIcon className="h-10 w-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                No holidays scheduled
              </h3>
              <p className="text-muted-foreground max-w-xs mb-8">
                Keep your team informed about upcoming time off by
                scheduling holidays.
              </p>
              <Button
                onClick={() => handleOpenHolidayDialog()}
                variant="outline"
                className="border-2"
              >
                <Plus className="mr-2 h-4 w-4" /> Create First Holiday
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-10">
            {Object.entries(groupedHolidays).map(
              ([monthYear, monthHolidays]) => (
                <div key={monthYear} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-foreground whitespace-nowrap">
                      {monthYear}
                    </h3>
                    <div className="h-px bg-muted w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {monthHolidays.map((holiday, index) => {
                      const { bg, title, badge } = getHolidayColor(index);
                      return (
                        <Card
                          key={holiday._id}
                          className={`group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 ${bg}`}
                        >
                          <div
                            className={`absolute top-0 left-0 w-1.5 h-full ${badge}`}
                          />
                          <CardHeader className="pb-0">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <CardTitle
                                  className={`text-lg font-bold ${title}`}
                                >
                                  {holiday.name}
                                </CardTitle>
                                <div
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${badge}`}
                                >
                                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                                  {format(parseISO(holiday.date), "PPP")}
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 rounded-full hover:bg-white/50 dark:hover:bg-black/20 ${title}`}
                                  onClick={() =>
                                    handleOpenHolidayDialog(holiday)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 rounded-full hover:bg-white/50 dark:hover:bg-black/20 text-destructive hover:text-destructive`}
                                  onClick={() =>
                                    handleDeleteHoliday(holiday._id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Holiday Dialog */}
      <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
            </DialogTitle>
            <DialogDescription>
              Set up a company holiday for your employees.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleHolidaySubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Holiday Name *</Label>
              <Input
                id="name"
                value={holidayForm.name}
                onChange={(e) =>
                  setHolidayForm({ ...holidayForm, name: e.target.value })
                }
                placeholder="e.g., Independence Day"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={holidayForm.date}
                onChange={(e) =>
                  setHolidayForm({ ...holidayForm, date: e.target.value })
                }
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsHolidayDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingHoliday ? "Update Holiday" : "Create Holiday"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Holiday</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this holiday? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deletingHoliday}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteHoliday}
              disabled={deletingHoliday}
            >
              {deletingHoliday ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
