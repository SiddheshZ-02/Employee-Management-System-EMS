import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  addEmployee,
  updateEmployee,
  deleteEmployee,
  setEmployees,
  type Employee,
} from "@/store/slices/employeeSlice";
import { Plus, Edit, Trash2, Search, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/constant/Config";

interface BackendEmployee {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  position?: string;
  department?: string;
  dateOfBirth?: string;
  createdAt?: string;
  isActive?: boolean;
}

export const EmployeeManagement = () => {
  const { employees: reduxEmployees } = useAppSelector(
    (state) => state.employees
  );
  const { departments } = useAppSelector((state) => state.departments);
  const { token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const generateEmployeeId = () => {
    if (!reduxEmployees || reduxEmployees.length === 0) {
      return "EMP01";
    }

    // Extract numerical parts from existing IDs and find the max
    const numericParts = reduxEmployees
      .map((emp) => {
        const match = emp.employeeId?.match(/^EMP(\d+)$/);
        // If it's a very large number (like the old timestamp format), ignore it
        if (match && match[1].length < 10) {
          return parseInt(match[1], 10);
        }
        return 0;
      })
      .filter((n) => n > 0);

    const maxId = numericParts.length > 0 ? Math.max(...numericParts) : 0;
    const nextId = maxId + 1;

    return `EMP${nextId.toString().padStart(2, "0")}`;
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Use Redux state as primary source
  const employees = reduxEmployees;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    employeeId: "",
    position: "",
    phone: "",
    department: "",
    dateOfBirth: "",
    status: "Active" as "Active" | "Inactive",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      employeeId: "",
      position: "",
      phone: "",
      department: "",
      dateOfBirth: "",
      status: "Active",
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEditingEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: "",
      confirmPassword: "",
      role: "",
      employeeId: employee.employeeId,
      position: employee.position,
      phone: "",
      department: employee.department,
      dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : "",
      status: employee.status,
    });
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingEmployee(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      employeeId: generateEmployeeId(),
      position: "",
      phone: "",
      department: "",
      dateOfBirth: "",
      status: "Active",
    });
  };

  const fetchEmployee = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/employees?page=1&limit=100`,
        {
          method: "GET",
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

      const mapped: Employee[] = json.employees.map((emp: BackendEmployee) => ({
        id: String(emp._id),
        name: String(emp.name),
        email: String(emp.email),
        employeeId: String(emp.employeeId || ""),
        position: String(emp.position || emp.employeeId || ""),
        department: String(emp.department || ""),
        dateOfBirth: emp.dateOfBirth,
        joinDate: emp.createdAt
          ? new Date(emp.createdAt).toISOString()
          : new Date().toISOString(),
        status: emp.isActive === false ? "Inactive" : "Active",
      }));

      dispatch(setEmployees(mapped));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  }, [token, dispatch]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const fetchAddEmployee = async () => {
    if (!token) {
      toast({
        title: "Not authenticated",
        description: "Please log in again to add employees.",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        employeeId: formData.employeeId,
        department: formData.department,
        phone: formData.phone,
        position: formData.position,
        dateOfBirth: formData.dateOfBirth,
      };
      const response = await fetch(`${API_BASE_URL}/api/admin/employees`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const json = await response.json();

      if (!json.success || !json.employee) {
        throw new Error("Unexpected response while adding employee");
      }

      const emp = json.employee;
      const mapped: Employee = {
        id: String(emp._id),
        name: String(emp.name),
        email: String(emp.email),
        employeeId: String(emp.employeeId || ""),
        position: String(emp.position || emp.employeeId || ""),
        department: String(emp.department || ""),
        dateOfBirth: emp.dateOfBirth,
        joinDate: emp.createdAt
          ? new Date(emp.createdAt).toISOString()
          : new Date().toISOString(),
        status: emp.isActive === false ? "Inactive" : "Active",
      };

      dispatch(addEmployee(mapped));
      fetchEmployee();
      toast({
        title: "Employee Added",
        description: `${formData.name} has been added successfully`,
      });
    } catch (error) {
      console.error('Failed to add employee:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to add employee: ${message}`,
        variant: "destructive",
      });
    }
  };

  const fetchUpdateEmployee = async (payload: {
    id: string;
    name: string;
    email: string;
    employeeId: string;
    department: string;
    position: string;
    dateOfBirth: string;
    status: "Active" | "Inactive";
  }) => {
    if (!token) {
      toast({
        title: "Not authenticated",
        description: "Please log in again to update employees.",
        variant: "destructive",
      });
      return;
    }
    try {
      const body = {
        name: payload.name,
        email: payload.email,
        employeeId: payload.employeeId,
        department: payload.department,
        position: payload.position,
        dateOfBirth: payload.dateOfBirth,
        isActive: payload.status === "Active",
      };

      const response = await fetch(
        `${API_BASE_URL}/api/admin/employees/${payload.id}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const json = await response.json();

      if (!json.success || !json.employee) {
        throw new Error("Unexpected response while updating employee");
      }

      const emp = json.employee;
      const mapped: Employee = {
        id: String(emp._id),
        name: String(emp.name),
        email: String(emp.email),
        employeeId: String(emp.employeeId || ""),
        position: String(emp.position || emp.employeeId || ""),
        department: String(emp.department || ""),
        dateOfBirth: emp.dateOfBirth,
        joinDate: emp.createdAt
          ? new Date(emp.createdAt).toISOString()
          : new Date().toISOString(),
        status: emp.isActive === false ? "Inactive" : "Active",
      };

      dispatch(updateEmployee(mapped));
      fetchEmployee();
      toast({
        title: "Employee Updated",
        description: `${payload.name} has been updated successfully`,
      });
    } catch (error) {
      console.error('Failed to update employee:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to update employee: ${message}`,
        variant: "destructive",
      });
    }
  };

  const fetchDeleteEmployee = async (employee: Employee) => {
    const employeeId = employee.id || employee._id;
    if (!token || !employeeId) {
      toast({
        title: "Error",
        description: !token ? "Please log in again." : "Invalid employee ID.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/employees/${employeeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      dispatch(deleteEmployee(employeeId as string));
      fetchEmployee();
      toast({
        title: "Employee Deleted",
        description: `${employee.name} has been removed from the system`,
      });
    } catch (error) {
      console.error('Failed to delete employee:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to delete employee: ${message}`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.position.trim()) newErrors.position = "Position is required";
    if (!formData.department) newErrors.department = "Department is required";

    if (!editingEmployee) {
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone must be exactly 10 digits";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Minimum 6 characters";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirm password is required";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!formData.role) newErrors.role = "Role is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      });
      return;
    }

    if (!editingEmployee) {
      fetchAddEmployee();
    } else if (editingEmployee && (editingEmployee.id || editingEmployee._id)) {
      const updatePayload = {
        id: (editingEmployee.id || editingEmployee._id) as string,
        name: formData.name,
        email: formData.email,
        employeeId: formData.employeeId,
        department: formData.department,
        position: formData.position,
        dateOfBirth: formData.dateOfBirth,
        status: formData.status,
      };
      fetchUpdateEmployee(updatePayload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (employee: Employee) => {
    fetchDeleteEmployee(employee);
  };

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Employee Management</h2>
              <p className="text-muted-foreground">
                Manage your organization's employees and their information
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl">
                    All Employees
                  </CardTitle>
                  <CardDescription className="text-sm">
                    View and manage employee records ({employees.length} total)
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddClick}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto mx-4 sm:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingEmployee ? "Edit Employee" : "Add New Employee"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingEmployee
                          ? "Update employee information below."
                          : "Enter the details for the new employee."}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => {
                              setFormData({ ...formData, name: e.target.value });
                              if (errors.name) setErrors({ ...errors, name: "" });
                            }}
                            placeholder="Enter full name"
                            className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                          />
                          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                              setFormData({ ...formData, email: e.target.value });
                              if (errors.email) setErrors({ ...errors, email: "" });
                            }}
                            placeholder="Enter email address"
                            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                          />
                          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        {!editingEmployee && (
                          <>
                            <div className="grid gap-2">
                              <Label htmlFor="employeeId">Employee ID</Label>
                              <Input
                                id="employeeId"
                                value={formData.employeeId}
                                readOnly
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="phone" className={errors.phone ? "text-destructive" : ""}>Phone Number</Label>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                  setFormData({ ...formData, phone: val });
                                  if (errors.phone) setErrors({ ...errors, phone: "" });
                                }}
                                placeholder="Enter 10-digit phone number"
                                className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                              />
                              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>Password</Label>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  value={formData.password}
                                  onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    if (errors.password) setErrors({ ...errors, password: "" });
                                  }}
                                  placeholder="Enter password"
                                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="confirmPassword" className={errors.confirmPassword ? "text-destructive" : ""}>
                                Confirm Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="confirmPassword"
                                  type={showConfirmPassword ? "text" : "password"}
                                  value={formData.confirmPassword}
                                  onChange={(e) => {
                                    setFormData({ ...formData, confirmPassword: e.target.value });
                                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                                  }}
                                  placeholder="Confirm password"
                                  className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="role" className={errors.role ? "text-destructive" : ""}>Role</Label>
                              <Select
                                value={formData.role}
                                onValueChange={(value) => {
                                  setFormData({ ...formData, role: value });
                                  if (errors.role) setErrors({ ...errors, role: "" });
                                }}
                              >
                                <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="employee">
                                    Employee
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                            </div>
                          </>
                        )}
                        <div className="grid gap-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dateOfBirth: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="position" className={errors.position ? "text-destructive" : ""}>Position</Label>
                          <Input
                            id="position"
                            value={formData.position}
                            onChange={(e) => {
                              setFormData({ ...formData, position: e.target.value });
                              if (errors.position) setErrors({ ...errors, position: "" });
                            }}
                            placeholder="Enter position"
                            className={errors.position ? "border-destructive focus-visible:ring-destructive" : ""}
                          />
                          {errors.position && <p className="text-xs text-destructive">{errors.position}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="department" className={errors.department ? "text-destructive" : ""}>Department</Label>
                          <Select
                            value={formData.department}
                            onValueChange={(value) => {
                              setFormData({ ...formData, department: value });
                              if (errors.department) setErrors({ ...errors, department: "" });
                            }}
                          >
                            <SelectTrigger className={errors.department ? "border-destructive" : ""}>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => {
                                if (typeof dept === "string") {
                                  return (
                                    <SelectItem key={dept} value={dept}>
                                      {dept}
                                    </SelectItem>
                                  );
                                } else {
                                  return (
                                    <SelectItem key={dept.id} value={dept.name}>
                                      {dept.name}
                                    </SelectItem>
                                  );
                                }
                              })}
                            </SelectContent>
                          </Select>
                          {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: "Active" | "Inactive") =>
                              setFormData({ ...formData, status: value })
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
                        <Button type="submit" className="w-full sm:w-auto">
                          {editingEmployee ? "Update Employee" : "Add Employee"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
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
                        Name
                      </TableHead>
                      <TableHead className="min-w-[150px] font-semibold text-foreground text-center sm:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="min-w-[120px] font-semibold text-foreground text-center">
                        Position
                      </TableHead>
                      <TableHead className="min-w-[120px] font-semibold text-foreground text-center md:table-cell">
                        Department
                      </TableHead>
                      <TableHead className="min-w-[120px] font-semibold text-foreground text-center lg:table-cell">
                        Join Date
                      </TableHead>
                      <TableHead className="min-w-[100px] font-semibold text-foreground text-center">
                        Status
                      </TableHead>
                      <TableHead className="min-w-[120px] font-semibold text-foreground text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEmployees.map((employee, index) => (
                      <TableRow
                        key={employee.id}
                        className="hover:bg-muted/30 transition-colors border-b last:border-0"
                      >
                        <TableCell className="text-center font-medium">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {employee.name}
                            </div>
                            <div className="text-sm text-muted-foreground sm:hidden truncate">
                              {employee.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="sm:table-cell text-center">
                          <div className="truncate">{employee.email}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="truncate">{employee.position}</div>
                        </TableCell>
                        <TableCell className="md:table-cell text-center">
                          <div className="truncate">{employee.department}</div>
                        </TableCell>
                        <TableCell className="lg:table-cell text-center">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(employee.joinDate).toLocaleDateString(
                              "en-GB"
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              employee.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              employee.status === "Active"
                                ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                                : "bg-secondary/10 text-secondary-foreground border-secondary/20 hover:bg-secondary/20"
                            }
                          >
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/admin/employees/${employee.id || employee._id}`)
                              }
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(employee)}
                              className="h-8 w-8 p-0"
                              title="Edit Employee"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(employee)}
                              className="text-destructive hover:text-destructive h-8 w-8 p-0"
                              title="Delete Employee"
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
              {filteredEmployees.length > 0 && (
                <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-card mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredEmployees.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {filteredEmployees.length}
                    </span>{" "}
                    employees
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
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) pageNum = i + 1;
                          else if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= totalPages - 2)
                            pageNum = totalPages - 4 + i;
                          else pageNum = currentPage - 2 + i;

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              className={`h-8 w-8 p-0 ${
                                currentPage === pageNum ? "shadow-sm" : ""
                              }`}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
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
