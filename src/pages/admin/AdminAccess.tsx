import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  CalendarDays, 
  Settings2, 
  ChevronRight,
  CalendarCheck
} from "lucide-react";

export const AdminAccess = () => {
  const navigate = useNavigate();

  const accessModules = [
    {
      title: "Company Holidays",
      description: "Configure and manage organizational holiday calendars.",
      icon: <CalendarDays className="h-6 w-6 text-primary" />,
      path: "/admin/holidays",
      color: "bg-blue-500/50",
    },
    {
      title: "Company Week Off",
      description: "Define standard non-working days for the organization.",
      icon: <Settings2 className="h-6 w-6 text-primary" />,
      path: "/admin/weekoff",
      color: "bg-purple-500/50",
    },
    {
      title: "Leave Allocation",
      description: "Manage leave types and grant yearly leave balances.",
      icon: <CalendarCheck className="h-6 w-6 text-primary" />,
      path: "/admin/leave-allocation",
      color: "bg-green-500/50",
    },
  ];

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Admin Access
        </h2>
        <p className="text-muted-foreground text-lg">
          Configure organizational policies, schedules, and leave systems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accessModules.map((module) => (
          <Card
            key={module.path}
            className="group cursor-pointer hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/30 overflow-hidden bg-card"
            onClick={() => navigate(module.path)}
          >
            <CardHeader className={`${module.color} p-4 `}>
              <div className="flex justify-between items-center">
                <div className="p-2 bg-background rounded-2xl shadow-sm border border-border/50 group-hover:scale-110 transition-all duration-500 group-hover:shadow-md group-hover:border-primary/20">
                  {module.icon}
                </div>
                <div className="p-1 bg-background/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 shadow-sm border border-border/50">
                  <ChevronRight className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent >
              <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                {module.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-[15px] leading-relaxed">
                {module.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
