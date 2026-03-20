import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, UserPlus, Users, PlusCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { apiRequest } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface OwnerStats {
  totalCompanies: number;
  totalAdmins: number;
}

export const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<OwnerStats>({
    totalCompanies: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        // Since there is no stats endpoint, we can fetch companies to get the count
        // and potentially admins too. For now, let's just fetch companies.
        const response = await apiRequest<{ success: boolean; data: any[] }>(
          "/api/owner/companies",
          { token }
        );
        if (response.success && Array.isArray(response.data)) {
          setStats((prev) => ({
            ...prev,
            totalCompanies: response.data.length,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Overview of your enterprise management system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Across all regions
            </p>
          </CardContent>
          <div className="absolute bottom-0 right-0 p-4 opacity-5">
            <Building2 className="h-16 w-16" />
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => navigate("/owner/companies/create")}
            >
              <PlusCircle className="h-4 w-4" />
              New Company
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => navigate("/owner/companies")}
            >
              <Users className="h-4 w-4" />
              Manage All
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/owner/companies")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Company Management
            </CardTitle>
            <CardDescription>
              View, edit, and manage all registered companies and their domains.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-medium text-primary">
              View Companies <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/owner/companies/create")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Onboard New Enterprise
            </CardTitle>
            <CardDescription>
              Register a new company and set up its first administrator account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-medium text-primary">
              Start Onboarding <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

