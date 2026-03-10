import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Company {
  _id: string;
  name: string;
  domain?: string;
  createdAt?: string;
}

export const CompanyList = () => {
  const { token } = useAppSelector((state) => state.auth);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCompanies = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await apiRequest<{ success: boolean; data: Company[] }>(
          "/api/owner/companies",
          { token }
        );
        if (response.success && Array.isArray(response.data)) {
          setCompanies(response.data);
        } else {
          toast({
            title: "Failed to load companies",
            description: "Unexpected response from server.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Failed to load companies",
          description: "An error occurred while fetching companies.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [token]);

  const handleCreateCompany = () => {
    navigate("/owner/companies/create");
  };

  const handleViewAdmins = (companyId: string) => {
    navigate(`/owner/companies/${companyId}/admins`);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground text-sm">
            All companies owned by your account.
          </p>
        </div>
        <Button onClick={handleCreateCompany}>Create Company</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Loading companies...
            </div>
          ) : companies.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No companies found. Create your first company to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company._id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.domain || "-"}</TableCell>
                    <TableCell>
                      {company.createdAt
                        ? new Date(company.createdAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAdmins(company._id)}
                      >
                        Manage Admins
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

