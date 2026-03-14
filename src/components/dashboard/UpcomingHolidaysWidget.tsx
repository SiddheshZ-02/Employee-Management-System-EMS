import { useMemo, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Calendar as CalendarIcon, ChevronRight, PartyPopper, Sparkles } from "lucide-react";
import { format, parseISO, isAfter, startOfDay, isSameDay, differenceInDays } from "date-fns";

const LIGHT_COLORS = [
  "bg-blue-50 border-blue-100 text-blue-700",
  "bg-emerald-50 border-emerald-100 text-emerald-700",
  "bg-purple-50 border-purple-100 text-purple-700",
  "bg-amber-50 border-amber-100 text-amber-700",
  "bg-rose-50 border-rose-100 text-rose-700",
  "bg-indigo-50 border-indigo-100 text-indigo-700",
  "bg-cyan-50 border-cyan-100 text-cyan-700",
];

const getPastelColor = (index: number) => LIGHT_COLORS[index % LIGHT_COLORS.length];

export const UpcomingHolidaysWidget = () => {
  const { holidays } = useAppSelector((state) => state.holiday);
  const [today, setToday] = useState(startOfDay(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = startOfDay(new Date());
      if (!isSameDay(now, today)) {
        setToday(now);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [today]);

  const upcomingHolidays = useMemo(() => {
    return holidays
      .filter((h) => isAfter(parseISO(h.date), today) || isSameDay(parseISO(h.date), today))
      .sort((a, b) => a.date.localeCompare(b.date));
      // Removed slice to show all in scrollable area
  }, [holidays, today]);

  return (
    <Card className="hover-lift transition-smooth border-0 shadow-lg overflow-hidden bg-gradient-to-br from-card to-card/95 flex flex-col h-[380px]">
      <CardHeader className="pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <PartyPopper className="h-5 w-5 text-primary" />
            </div>
            <span>Upcoming Holidays</span>
          </CardTitle>
          {upcomingHolidays.length > 0 && (
            <Badge variant="secondary" className="font-medium bg-primary/5 text-primary border-primary/10">
              {upcomingHolidays.length} events
            </Badge>
          )}
        </div>
        <CardDescription>
          Plan your time off around these upcoming breaks
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0 overflow-y-auto scrollbar-hide flex-1">
        {upcomingHolidays.length > 0 ? (
          <div className="space-y-3">
            {upcomingHolidays.map((holiday, index) => {
              const date = parseISO(holiday.date);
              const isToday = isSameDay(date, today);
              const daysLeft = differenceInDays(date, today);
              const colorClasses = getPastelColor(index);

              return (
                <div
                  key={holiday._id}
                  className={`group relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${colorClasses}`}
                >
                  <div className="flex flex-col items-center justify-center min-w-[50px] h-[54px] rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border-white/50 group-hover:bg-white transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                      {format(date, "MMM")}
                    </span>
                    <span className="text-xl font-bold tracking-tight">
                      {format(date, "dd")}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold truncate">
                        {holiday.name}
                      </h4>
                      {isToday && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-4 px-1.5 animate-pulse">
                          TODAY
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-[11px] font-medium opacity-70">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {format(date, "EEEE, MMMM do")}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {!isToday && (
                      <span className="text-[10px] font-bold bg-white/40 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                        {daysLeft === 1 ? "Tomorrow" : `In ${daysLeft} days`}
                      </span>
                    )}
                    {/* <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                    </div> */}
                  </div>

                  {isToday && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="h-4 w-4 text-emerald-500 animate-bounce" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 bg-primary/5 rounded-xl border border-dashed border-primary/20">
            <div className="p-3 rounded-full bg-primary/10">
              <CalendarIcon className="h-6 w-6 text-primary/40" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-primary/80">
                No holidays for this month
              </p>
              <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                Enjoy your work days! Stay tuned for next month's breaks.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

