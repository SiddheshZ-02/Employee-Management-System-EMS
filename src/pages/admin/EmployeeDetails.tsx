import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/constant/Config";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  User, 
  Clock, 
  FileText, 
  ShieldCheck, 
  ShieldAlert,
  Hash,
  Activity,
  CalendarDays
} from "lucide-react";

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
    totalHours?: number;
    presentDays?: number;
  };
  pendingLeaves?: number;
}

export const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EmployeeDetailsResponse | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setLoading(false);
        toast({ title: "Error", description: "Failed to load employee details", variant: "destructive" });
        return;
      }
      const responseData: EmployeeDetailsResponse = await res.json();
      if (!responseData.success || !responseData.employee) {
        setLoading(false);
        toast({ title: "Error", description: "Unexpected response", variant: "destructive" });
        return;
      }
      setData(responseData);
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
      const res = await fetch(`${API_BASE_URL}/api/admin/employees/${id}/toggle-status`, {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const employee = data?.employee;
  const attendance = data?.attendanceSummary;
  const leaves = data?.pendingLeaves;

  if (!employee) {
    return (
      <div className="w-full min-h-full bg-background">
        <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center gap-4">
          <div className="text-muted-foreground text-lg">Employee not found</div>
          <Button variant="outline" onClick={() => navigate("/admin/employees")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-background pb-10">
      <div className="w-full h-full p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/admin/employees")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{employee.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={employee.isActive === false ? "secondary" : "default"}
                  className={employee.isActive === false ? "bg-muted" : "bg-green-500/10 text-green-500 border-green-500/20"}
                >
                  {employee.isActive === false ? (
                    <ShieldAlert className="h-3 w-3 mr-1" />
                  ) : (
                    <ShieldCheck className="h-3 w-3 mr-1" />
                  )}
                  {employee.isActive === false ? "Inactive" : "Active"}
                </Badge>
                <span className="text-muted-foreground text-sm">• Joined {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "-"}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              className="flex-1 sm:flex-none"
              variant={employee.isActive === false ? "default" : "outline"}
              onClick={toggleStatus}
            >
              {employee.isActive === false ? "Activate Account" : "Deactivate Account"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: Profile Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex flex-col items-center text-center pb-6 border-b">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-background shadow-sm">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground">{employee.position || "Staff Member"}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Email Address</p>
                      <p className="text-sm font-medium truncate">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Phone Number</p>
                      <p className="text-sm font-medium">{employee.phone || employee.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Detailed Information */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employment Information</CardTitle>
                <CardDescription>Professional background and organization details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-muted/20 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p className="font-bold text-base">{employee.employeeId || "Not Assigned"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-muted/20 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-bold text-base">{employee.department || "General"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-muted/20 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-bold text-base">{employee.position || employee.employeeId || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-muted/20 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joining Date</p>
                    <p className="font-bold text-base">
                      {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      }) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
