import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_BASE_URL } from "@/constant/Config";
import { toast } from "@/hooks/use-toast";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token) {
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/admin/employees?page=1&limit=200`, {
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

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const current = Math.min(currentPage, totalPages);
  const start = (current - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(start, start + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
                      <TableHead className="text-center">Sr. No.</TableHead>
                      <TableHead className="text-center">Name</TableHead>
                      <TableHead className="text-center">Email</TableHead>
                      <TableHead className="text-center">Department</TableHead>
                      <TableHead className="text-center">Position</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                          Loading employees...
                        </TableCell>
                      </TableRow>
                    ) : paginatedEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                          No employees found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedEmployees.map((emp, index) => (
                        <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <TableCell className="text-center" onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            {start + index + 1}
                          </TableCell>
                          <TableCell className="text-center" onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            {emp.name || "-"}
                          </TableCell>
                          <TableCell className="text-center" onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            {emp.email || "-"}
                          </TableCell>
                          <TableCell className="text-center" onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            {emp.department || "-"}
                          </TableCell>
                          <TableCell className="text-center" onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            {emp.position || "-"}
                          </TableCell>
                          <TableCell className="text-center" onClick={() => navigate(`/admin/attendance/${emp.id}`)}>
                            <Badge variant={emp.status === "Active" ? "default" : "secondary"}>
                              {emp.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/attendance/${emp.id}`)}
                              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {!loading && filteredEmployees.length > 0 && (
                <div className="flex items-center justify-between px-2 py-4 border-t mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{start + 1}</span> to{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(start + itemsPerPage, filteredEmployees.length)}
                    </span>{" "}
                    of <span className="font-medium text-foreground">{filteredEmployees.length}</span> employees
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={current === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          if (totalPages <= 5) return true;
                          if (page === 1 || page === totalPages) return true;
                          return Math.abs(page - current) <= 1;
                        })
                        .map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipsis && <span className="text-muted-foreground">...</span>}
                              <Button
                                variant={current === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={`h-8 w-8 p-0 ${current === page ? "pointer-events-none" : ""}`}
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={current === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
