import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const OwnerDashboard = () => {
  const navigate = useNavigate();

  const handleViewCompanies = () => {
    navigate("/owner/companies");
  };

  const handleCreateCompany = () => {
    navigate("/owner/companies/create");
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Owner Dashboard</h1>
      <p className="text-muted-foreground">
        Manage your companies and their admin users.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Companies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              View and manage all companies you own.
            </p>
            <Button onClick={handleViewCompanies} className="w-full">
              View Companies
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Create a new company and seed its first admin.
            </p>
            <Button onClick={handleCreateCompany} className="w-full">
              Create Company
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

