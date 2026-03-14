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
      icon: <CalendarDays className="h-8 w-8 text-primary" />,
      path: "/admin/holidays",
      color: "bg-blue-500/10",
    },
    {
      title: "Company Week Off",
      description: "Define standard non-working days for the organization.",
      icon: <Settings2 className="h-8 w-8 text-primary" />,
      path: "/admin/weekoff",
      color: "bg-purple-500/10",
    },
    {
      title: "Leave Allocation",
      description: "Manage leave types and grant yearly leave balances.",
      icon: <CalendarCheck className="h-8 w-8 text-primary" />,
      path: "/admin/leave-allocation",
      color: "bg-green-500/10",
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
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden"
            onClick={() => navigate(module.path)}
          >
            <CardHeader className={`${module.color} pb-8`}>
              <div className="flex justify-between items-start">
                <div className="p-3 bg-background rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {module.icon}
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                {module.title}
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {module.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
