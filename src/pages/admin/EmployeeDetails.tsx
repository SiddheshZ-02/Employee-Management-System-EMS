import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/constant/Config";
import { toast } from "@/hooks/use-toast";

interface EmployeeDetailsResponse {
  success?: boolean;
  employee?: {
    _id: string;
    name: string;
    email: string;
    employeeId?: string;
    department?: string;
    phone?: string;
    phoneNumber?: string;
    isActive?: boolean;
    createdAt?: string;
    position?: string;
  };
  attendanceSummary?: {
    totalDays?: number;
    totalHours?: string;
    presentDays?: number;
  };
  pendingLeaves?: number;
}

export const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<EmployeeDetailsResponse["employee"] | null>(null);



  const fetchDetails = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setLoading(false);
        toast({ title: "Error", description: "Failed to load employee details", variant: "destructive" });
        return;
      }
      const data: EmployeeDetailsResponse = await res.json();
      if (!data.success || !data.employee) {
        setLoading(false);
        toast({ title: "Error", description: "Unexpected response", variant: "destructive" });
        return;
      }
      setEmployee(data.employee);


    } catch {
      toast({ title: "Error", description: "Network error while fetching details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const toggleStatus = async () => {
    if (!token || !id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/employees/${id}/toggle-status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toast({ title: "Error", description: "Failed to toggle status", variant: "destructive" });
        return;
      }
      toast({ title: "Status updated" });
      fetchDetails();
    } catch {
      toast({ title: "Error", description: "Network error while updating status", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-full bg-background">
        <div className="p-4 md:p-6 lg:p-8">Loading...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="w-full min-h-full bg-background">
        <div className="p-4 md:p-6 lg:p-8">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <div className="mt-4">Employee not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Employee Details</h2>
              <p className="text-muted-foreground">View and manage employee information</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/admin/employees")}>Back to list</Button>
              <Button onClick={toggleStatus}>
                {employee.isActive === false ? "Activate" : "Deactivate"}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{employee.name}</CardTitle>
              <CardDescription>{employee.email}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Employee ID</div>
                <div className="font-medium">{employee.employeeId || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Position</div>
                <div className="font-medium">
                  {employee.position || employee.employeeId || "-"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Department</div>
                <div className="font-medium">{employee.department || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">
                  {employee.phone || employee.phoneNumber || "-"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge variant={employee.isActive === false ? "secondary" : "default"}>
                  {employee.isActive === false ? "Inactive" : "Active"}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Joined</div>
                <div className="font-medium">
                  {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : "-"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Attendance</CardTitle>
                <CardDescription>Summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div>Total Days: {summary?.totalDays ?? 0}</div>
                  <div>Present Days: {summary?.presentDays ?? 0}</div>
                  <div>Total Hours: {summary?.totalHours ?? "0h 0m"}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pending Leaves</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingLeaves ?? 0}</div>
              </CardContent>
            </Card>
          </div> */}

        </div>
      </div>
    </div>
  );
};
