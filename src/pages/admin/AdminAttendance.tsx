import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_BASE_URL } from "@/constant/Config";
import { toast } from "@/hooks/use-toast";

interface BackendEmployee {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  position?: string;
  department?: string;
  isActive?: boolean;
}

interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  position: string;
  status: "Active" | "Inactive";
}

export const AdminAttendance = () => {
  const { token } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token) {
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/admin/employees?page=1&limit=200`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          toast({
            title: "Error",
            description: "Failed to load employees for attendance view",
            variant: "destructive",
          });
          return;
        }
        const json: {
          success?: boolean;
          employees?: BackendEmployee[];
        } = await response.json();
        if (!json.success || !Array.isArray(json.employees)) {
          toast({
            title: "Error",
            description: "Unexpected response while fetching employees",
            variant: "destructive",
          });
          return;
        }
        const mapped: EmployeeRow[] = json.employees.map((emp) => {
          const employeeId = emp.employeeId ? String(emp.employeeId) : "";
          const department = emp.department ? String(emp.department) : "";
          const position = emp.position ? String(emp.position) : "";
          return {
            id: String(emp._id),
            name: String(emp.name),
            email: String(emp.email),
            employeeId,
            department,
            position,
            status: emp.isActive === false ? "Inactive" : "Active",
          };
        });
        setEmployees(mapped);
      } catch {
        toast({
          title: "Error",
          description: "Network error while loading employees",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [token]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) {
      return employees;
    }
    const term = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.employeeId.toLowerCase().includes(term) ||
        emp.department.toLowerCase().includes(term),
    );
  }, [employees, searchTerm]);

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Attendance</h2>
              <p className="text-muted-foreground">
                Select an employee to view detailed attendance and leave history.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Employees</CardTitle>
                  <CardDescription>Choose an employee to open their attendance page.</CardDescription>
                </div>
                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Search by name, email, ID, or department"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                          Loading employees...
                        </TableCell>
                      </TableRow>
                    ) : filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                          No employees found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <TableRow key={emp.id} className="cursor-pointer">
                          <TableCell onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            {emp.name || "-"}
                          </TableCell>
                          <TableCell onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            {emp.email || "-"}
                          </TableCell>
                          <TableCell onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            {emp.employeeId || "-"}
                          </TableCell>
                          <TableCell onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            {emp.department || "-"}
                          </TableCell>
                          <TableCell onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            {emp.position || "-"}
                          </TableCell>
                          <TableCell onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            {emp.status}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => navigate(`/admin/attendance/${emp.id}`)}
                            >
                              View Attendance
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
