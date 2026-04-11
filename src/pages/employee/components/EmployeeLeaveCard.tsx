import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeLeaveCardProps {
  leave_type_name: string;
  available_days: number;
  total_days: number;
  used_days: number;
  expires_in_days: number;
  expiry_date: string;
}

const EmployeeLeaveCard: React.FC<EmployeeLeaveCardProps> = ({
  leave_type_name,
  available_days,
  total_days,
  used_days,
  expires_in_days,
  expiry_date,
}) => {
  // Urgency level based on days until expiry
  const urgency =
    expires_in_days <= 7 ? 'critical' :
    expires_in_days <= 15 ? 'warning' : 'safe';

  const urgencyConfig = {
    critical: {
      badge: 'bg-red-500/15 text-red-600 border-red-300',
      accent: 'bg-red-500',
      glow: 'shadow-red-100 dark:shadow-red-900/20',
      ring: 'border-red-200 dark:border-red-800',
      pulseClass: 'animate-pulse',
      label: `Expires in ${expires_in_days}d`,
    },
    warning: {
      badge: 'bg-amber-500/15 text-amber-600 border-amber-300',
      accent: 'bg-amber-500',
      glow: 'shadow-amber-100 dark:shadow-amber-900/20',
      ring: 'border-amber-200 dark:border-amber-800',
      pulseClass: '',
      label: `Expires in ${expires_in_days}d`,
    },
    safe: {
      badge: 'bg-green-500/15 text-green-600 border-green-300',
      accent: 'bg-primary',
      glow: '',
      ring: 'border-border/60',
      pulseClass: '',
      label: `${expires_in_days}d left`,
    },
  }[urgency];

  const availPercent = total_days > 0 ? Math.min(100, (available_days / total_days) * 100) : 100;

  const expiryFormatted = (() => {
    try {
      return format(new Date(expiry_date), 'dd MMM yyyy');
    } catch {
      return '—';
    }
  })();

  return (
    <Card
      className={`relative overflow-hidden group hover:shadow-md transition-all duration-300 border-2 ${urgencyConfig.ring} ${urgencyConfig.glow}`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${urgencyConfig.accent} opacity-80`} />

      <CardContent className="p-5 pt-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${
              urgency === 'critical' ? 'bg-red-500/10 group-hover:bg-red-500/20' :
              urgency === 'warning' ? 'bg-amber-500/10 group-hover:bg-amber-500/20' :
              'bg-primary/10 group-hover:bg-primary/15'
            }`}>
              <CalendarDays className={`h-5 w-5 ${
                urgency === 'critical' ? 'text-red-500' :
                urgency === 'warning' ? 'text-amber-500' :
                'text-primary'
              }`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">{leave_type_name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Granted Leave</p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`text-[10px] font-semibold px-2 py-0.5 shrink-0 border ${urgencyConfig.badge} ${urgencyConfig.pulseClass}`}
          >
            {urgencyConfig.label}
          </Badge>
        </div>

        {/* Big count */}
        <div className="flex items-baseline gap-1 mb-3">
          <span className={`text-4xl font-extrabold leading-none ${
            urgency === 'critical' ? 'text-red-500' :
            urgency === 'warning' ? 'text-amber-500' :
            'text-primary'
          }`}>
            {available_days}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            / {total_days} Days
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-3 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${urgencyConfig.accent}`}
            style={{ width: `${availPercent}%` }}
          />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Used: <span className="font-semibold text-foreground">{used_days}</span></span>
          </div>
          <div className="flex items-center gap-1">
            <span>Available: <span className="font-semibold text-foreground">{available_days}</span></span>
          </div>
        </div>

        {/* Expiry footer */}
        <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg ${
          urgency === 'critical' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
          urgency === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
          'bg-muted text-muted-foreground'
        }`}>
          <Clock className="h-3 w-3 shrink-0" />
          <span>Expires: <span className="font-semibold">{expiryFormatted}</span></span>
          <span className="ml-auto opacity-70">({expires_in_days} days left)</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeLeaveCard;
