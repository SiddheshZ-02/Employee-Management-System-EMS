import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { deleteDepartment, setDepartments, type Department } from "@/store/slices/departmentSlice";
import { setEmployees } from "@/store/slices/employeeSlice";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { API_BASE_URL } from "@/constant/Config";

interface BackendDepartment {
  _id: string;
  name: string;
  description: string;
  manager: string;
  employeeCount?: number;
  status?: string;
}

interface BackendEmployee {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  position?: string;
  department?: string;
  createdAt?: string;
  isActive?: boolean;
}

export const DepartmentManagement = () => {
  const { departments } = useAppSelector((state) => state.departments);
  const { employees } = useAppSelector((state) => state.employees);
  const { token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const fetchDepartments = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/departments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to fetch departments",
          variant: "destructive",
        });
        return;
      }

      const json = await response.json();

      if (!json.success || !Array.isArray(json.departments)) {
        toast({
          title: "Error",
          description: "Unexpected response while fetching departments",
          variant: "destructive",
        });
        return;
      }

      const mapped = json.departments.map((dept: BackendDepartment) => ({
        id: String(dept._id),
        name: String(dept.name),
        description: String(dept.description),
        manager: String(dept.manager),
        employeeCount: typeof dept.employeeCount === "number" ? dept.employeeCount : 0,
        status: dept.status === "Inactive" ? "Inactive" : "Active",
      }));

      dispatch(setDepartments(mapped));
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      });
    }
  }, [token, dispatch]);

  const fetchEmployees = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/employees?page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (!json.success || !Array.isArray(json.employees)) {
        throw new Error("Unexpected response while fetching employees");
      }
      const mapped = json.employees.map((emp: BackendEmployee) => ({
        id: String(emp._id),
        name: String(emp.name),
        email: String(emp.email),
        employeeId: String(emp.employeeId || ""),
        position: String(emp.position || emp.employeeId || ""),
        department: String(emp.department || ""),
        joinDate: emp.createdAt
          ? new Date(emp.createdAt).toISOString()
          : new Date().toISOString(),
        status: emp.isActive === false ? "Inactive" : "Active",
      }));
      dispatch(setEmployees(mapped));
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    }
  }, [token, dispatch]);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, [fetchDepartments, fetchEmployees]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: "",

    status: "Active" as "Active" | "Inactive",
  });

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique employee names for manager selection
  const employeeNames = [...new Set(employees.map((emp) => emp.name))];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      manager: "",

      status: "Active",
    });
    setEditingDepartment(null);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      manager: department.manager,

      status: department.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in department name and description",
        variant: "destructive",
      });
      return;
    }
    if (editingDepartment) {
      try {
        if (!token) {
          toast({
            title: "Error",
            description: "You are not authenticated",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/admin/departments/${editingDepartment.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: formData.name,
              description: formData.description,
              manager: formData.manager,
              status: formData.status,
            }),
          }
        );

        if (!response.ok) {
          toast({
            title: "Error",
            description: "Failed to update department",
            variant: "destructive",
          });
          return;
        }

        fetchDepartments();
        toast({
          title: "Department Updated",
          description: `${formData.name} has been updated successfully`,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update department",
          variant: "destructive",
        });
      }
    } else {
      try {
        if (!token) {
          toast({
            title: "Error",
            description: "You are not authenticated",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/admin/departments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: formData.name,
              description: formData.description,
              manager: formData.manager,
              status: formData.status,
            }),
          }
        );

        if (!response.ok) {
          toast({
            title: "Error",
            description: "Failed to add department",
            variant: "destructive",
          });
          return;
        }

        fetchDepartments();
        toast({
          title: "Department Added",
          description: `${formData.name} has been created successfully`,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to add department",
          variant: "destructive",
        });
      }
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (department: Department) => {
    try {
      if (!token) {
        toast({
          title: "Error",
          description: "You are not authenticated",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/departments/${department.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const message =
          response.status === 409
            ? "Department has assigned employees and cannot be deleted"
            : "Failed to delete department";

        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        return;
      }

      dispatch(deleteDepartment(department.id));
      fetchDepartments();
      toast({
        title: "Department Deleted",
        description: `${department.name} has been removed from the system`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold truncate">
                Department Management
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage organizational departments and their structure
              </p>
            </div>
          </div>

          

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl">
                    All Departments
                  </CardTitle>
                  <CardDescription className="text-sm">
                    View and manage department information ({departments.length}{" "}
                    total)
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate">Add Department</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
                    <DialogHeader>
                      <DialogTitle>
                        {editingDepartment
                          ? "Edit Department"
                          : "Add New Department"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingDepartment
                          ? "Update department information below."
                          : "Enter the details for the new department."}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Department Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g., Engineering"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            placeholder="Brief description of the department"
                            rows={3}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="manager">Department Manager</Label>
                          <Select
                            value={formData.manager}
                            onValueChange={(value) =>
                              setFormData({ ...formData, manager: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select manager" />
                            </SelectTrigger>
                            <SelectContent>
                              {employeeNames.map((name) => (
                                <SelectItem key={name} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                status: value as "Active" | "Inactive",
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          {editingDepartment
                            ? "Update Department"
                            : "Add Department"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 shrink-0" />
                  <Input
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[80px] font-semibold text-foreground text-center">
                        Sr No
                      </TableHead>
                      <TableHead className="min-w-[150px] font-semibold text-foreground text-center">
                        Department
                      </TableHead>
                      <TableHead className="min-w-[120px] font-semibold text-foreground text-center hidden sm:table-cell">
                        Manager
                      </TableHead>
                      <TableHead className="min-w-[100px] font-semibold text-foreground text-center">
                        Employees
                      </TableHead>
                      <TableHead className="min-w-[80px] font-semibold text-foreground text-center">
                        Status
                      </TableHead>
                      <TableHead className="min-w-[100px] font-semibold text-foreground text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDepartments.map((department, index) => (
                      <TableRow key={department.id} className="hover:bg-muted/30 transition-colors border-b last:border-0">
                        <TableCell className="text-center font-medium">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="min-w-0 flex flex-col items-center">
                            <div className="font-medium truncate">
                              {department.name}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {department.description}
                            </div>
                            <div className="text-sm text-muted-foreground sm:hidden truncate">
                              Manager: {department.manager}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center">
                          <div className="truncate">{department.manager}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-foreground text-xs font-semibold">
                            {
                              employees.filter(
                                (emp) =>
                                  emp.department?.trim().toLowerCase() ===
                                  department.name.trim().toLowerCase()
                              ).length
                            }
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              department.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              department.status === "Active"
                                ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                                : "bg-secondary/10 text-secondary-foreground border-secondary/20 hover:bg-secondary/20"
                            }
                          >
                            {department.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(department)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(department)}
                              className="text-destructive hover:text-destructive h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Attendance Tracking Style Pagination Controls */}
              {filteredDepartments.length > 0 && (
                <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-card mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-semibold text-foreground">{Math.min(currentPage * itemsPerPage, filteredDepartments.length)}</span> of{" "}
                    <span className="font-semibold text-foreground">{filteredDepartments.length}</span> departments
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className={`h-8 w-8 p-0 ${currentPage === pageNum ? "shadow-sm" : ""}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-2"
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
