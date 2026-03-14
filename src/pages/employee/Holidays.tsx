import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import {
  setHolidays,
  setLoading,
  setError,
  type Holiday,
} from "@/store/slices/holidaySlice";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { format, parseISO, isAfter, startOfDay, addDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { UpcomingHolidaysWidget } from "@/components/dashboard/UpcomingHolidaysWidget";

const HOLIDAY_COLORS = [
  "bg-blue-500/5 border-blue-500/20",
  "bg-green-500/5 border-green-500/20",
  "bg-purple-500/5 border-purple-500/20",
  "bg-orange-500/5 border-orange-500/20",
  "bg-rose-500/5 border-rose-500/20",
  "bg-indigo-500/5 border-indigo-500/20",
  "bg-cyan-500/5 border-cyan-500/20",
];

const getHolidayColor = (index: number) => HOLIDAY_COLORS[index % HOLIDAY_COLORS.length];

export const EmployeeHolidays = () => {
  const { holidays, loading } = useAppSelector((state) => state.holiday);
  const { token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState("");

  const fetchHolidays = useCallback(async () => {
    if (!token) return;
    dispatch(setLoading(true));
    try {
      const data = await apiRequest<{ success: boolean; holidays: Holiday[] }>("/api/holidays", {
        token,
      });
      if (data.success) {
        dispatch(setHolidays(data.holidays));
      }
    } catch (err: any) {
      dispatch(setError(err.message));
      toast({
        title: "Error",
        description: "Failed to fetch holidays",
        variant: "destructive",
      });
    }
  }, [token, dispatch]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [holidays, searchQuery]);

  if (loading && holidays.length === 0) {
    return <div className="p-8 text-center">Loading holidays...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Company Holidays</h2>  
        <p className="text-sm text-muted-foreground">Stay updated with upcoming company holidays and observances</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search holidays..."
              className="pl-9 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredHolidays.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 rounded-lg border border-dashed">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-20 mx-auto" />
            <h3 className="text-lg font-semibold">No holidays found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredHolidays.map((holiday, index) => (
              <Card 
                key={holiday._id} 
                className={`group hover:shadow-sm transition-all border-l-4 ${getHolidayColor(index)}`}
              >
                <CardHeader className="px-4 ">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                        {holiday.name}
                      </CardTitle>
                      <CardDescription className="flex items-center text-xs font-medium text-muted-foreground">
                        <CalendarIcon className="mr-1.5 h-3 w-3 text-primary/70" />
                        {format(parseISO(holiday.date), "MMM dd, yyyy")}
                      </CardDescription>
                    </div>
                    {holiday.isRecurring && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase tracking-wider shrink-0 bg-white/50">
                        Annual
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
