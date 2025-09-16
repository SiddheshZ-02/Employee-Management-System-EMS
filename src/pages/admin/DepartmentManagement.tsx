import { useState, useEffect } from "react";
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
import {
  addDepartment,
  updateDepartment,
  deleteDepartment,
  setDepartments,
  type Department,
} from "@/store/slices/departmentSlice";
import { setEmployees } from "@/store/slices/employeeSlice";
import { Plus, Edit, Trash2, Search, Building2, Users } from "lucide-react";
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
import { BASE_URL } from "@/constant/Config";

export const DepartmentManagement = () => {
  const { departments } = useAppSelector((state) => state.departments);
  const { employees } = useAppSelector((state) => state.employees);
  const dispatch = useAppDispatch();

  // Fetch departments from API and sync Redux
  const fetchDepartments = async () => {
    try {
      const response = await fetch(BASE_URL + `/departments`);
      const data = await response.json();
      dispatch(setDepartments(data));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      });
    }
  };

  // Fetch employees from API and sync Redux
  const fetchEmployees = async () => {
    try {
      const response = await fetch(BASE_URL + `/employees`);
      const data = await response.json();
      dispatch(setEmployees(data));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

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
    if (!formData.name || !formData.description || !formData.manager) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    const employeeCount = employees.filter(
      (emp) => emp.department === formData.name
    ).length;
    if (editingDepartment) {
      // Update department via API
      try {
        const response = await fetch(
           BASE_URL +` /departments/${editingDepartment.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...editingDepartment,
              ...formData,
              employeeCount,
            }),
          }
        );
        const updated = await response.json();
        dispatch(updateDepartment(updated));
        fetchDepartments();
        toast({
          title: "Department Updated",
          description: `${formData.name} has been updated successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update department",
          variant: "destructive",
        });
      }
    } else {
      // Add department via API
      try {
        const response = await fetch(
          BASE_URL + `/departments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, employeeCount }),
          }
        );
        const added = await response.json();
        dispatch(addDepartment(added));
        fetchDepartments();
        toast({
          title: "Department Added",
          description: `${formData.name} has been created successfully`,
        });
      } catch (error) {
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
      await fetch(BASE_URL + `/departments/${department.id}`, {
        method: "DELETE",
      });
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Departments
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{employees.length}</div>
              </CardContent>
            </Card>
            {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(departments.reduce((sum, dept) => sum + dept.budget, 0) / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card> */}
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
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">
                        Department
                      </TableHead>
                      <TableHead className="min-w-[120px] hidden sm:table-cell">
                        Manager
                      </TableHead>
                      <TableHead className="min-w-[100px]">Employees</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="text-right min-w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDepartments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell>
                          <div className="min-w-0">
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
                        <TableCell className="hidden sm:table-cell">
                          <div className="truncate">{department.manager}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {
                              employees.filter(
                                (emp) =>
                                  emp.department?.trim().toLowerCase() ===
                                  department.name.trim().toLowerCase()
                              ).length
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              department.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                            className="shrink-0"
                          >
                            {department.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
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

              {/* Advanced Pagination Controls with Ellipsis */}
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) => Math.max(prev - 1, 1));
                        }}
                        isActive={false}
                      />
                    </PaginationItem>
                    {/* Show first page */}
                    {totalPages > 5 && currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === 1}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(1);
                            }}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      </>
                    )}
                    {/* Show page numbers around current page */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 5) return true;
                        if (currentPage <= 3) return page <= 5;
                        if (currentPage >= totalPages - 2)
                          return page >= totalPages - 4;
                        return Math.abs(page - currentPage) <= 2;
                      })
                      .map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    {/* Show last page */}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === totalPages}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(totalPages);
                            }}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          );
                        }}
                        isActive={false}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
