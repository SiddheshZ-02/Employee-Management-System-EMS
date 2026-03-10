import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  isActive?: boolean;
}

interface CompanyAdminsResponse {
  success: boolean;
  data: {
    company: Company;
    admins: AdminUser[];
  };
}

export const CompanyAdmins = () => {
  const { token } = useAppSelector((state) => state.auth);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAdmins = async () => {
      if (!token || !id) return;
      setLoading(true);
      try {
        const response = await apiRequest<CompanyAdminsResponse>(
          `/api/owner/companies/${id}/admins`,
          { token }
        );
        if (response.success) {
          setCompany(response.data.company);
          setAdmins(response.data.admins || []);
        } else {
          toast({
            title: "Failed to load admins",
            description: "Unexpected response from server.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Failed to load admins",
          description: "An error occurred while fetching admins.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAdmins();
  }, [token, id]);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {company ? company.name : "Company Admins"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Admin users for this company.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/owner/companies")}>
          Back to Companies
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admins</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Loading admins...
            </div>
          ) : admins.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No admins found for this company.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell className="capitalize">
                      {admin.role || "admin"}
                    </TableCell>
                    <TableCell>{admin.department || "-"}</TableCell>
                    <TableCell>{admin.position || "-"}</TableCell>
                    <TableCell>
                      {admin.isActive === false ? "Inactive" : "Active"}
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

