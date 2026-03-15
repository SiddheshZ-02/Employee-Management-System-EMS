import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
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
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHolidays.map((holiday, index) => {
              const { bg, title, badge } = getHolidayColor(index);
              return (
                <Card 
                  key={holiday._id} 
                  className={`group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 ${bg}`}
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${badge}`} />
                  <CardHeader className="px-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1 min-w-0">
                        <CardTitle className={`text-sm font-bold truncate transition-colors ${title}`}>
                          {holiday.name}
                        </CardTitle>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm ${badge}`}>
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {format(parseISO(holiday.date), "MMM dd, yyyy")}
                        </div>
                      </div>
                      {holiday.isRecurring && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase tracking-wider shrink-0 bg-white/50 dark:bg-black/20">
                          Annual
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
