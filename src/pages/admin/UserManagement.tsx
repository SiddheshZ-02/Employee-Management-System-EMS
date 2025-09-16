import { useEffect, useState } from "react";
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
  addAdmin,
  updateAdmin,
  deleteAdmin,
  type Admins,
} from "@/store/slices/adminSlice";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  UserCheck,
  Shield,
} from "lucide-react";
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

// import { useNavigate } from 'react-router-dom';

export const UserManagement = () => {
  const { admins: reduxAdmins } = useAppSelector((state) => state.admin);
  const { departments } = useAppSelector((state) => state.departments);
  const dispatch = useAppDispatch();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admins | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState<Admins[]>([]);
  // Sync local state with Redux when Redux changes
  useEffect(() => {
    setAdmins(reduxAdmins);
  }, [reduxAdmins]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    position: "",
    department: "",
    status: "Active" as "Active" | "Inactive",
  });

  const filteredAdmins = admins.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  const paginatedAdmins = filteredAdmins.slice(
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
      position: "",
      department: "",
      status: "Active",
    });
    setEditingAdmin(null);
  };

  const handleEdit = (admin: Admins) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      confirmPassword: "",
      role: "",
      position: admin.position,
      department: admin.department,
      status: admin.status,
    });
    setIsDialogOpen(true);
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(BASE_URL + `/admins`, {
        method: "GET",
        headers: {
          // accesstoken: "${token.access_token}", // Uncomment if token available
        },
      });
      const res = await response.json();
      setAdmins(res);
      // dispatch(setAdmins(res));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAddAdmins = async () => {
    try {
      const payload = {
        ...formData,
        joinDate: new Date().toISOString().split("T")[0],
      };
      const response = await fetch(BASE_URL + `/admins`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      dispatch(addAdmin(res));
      fetchAdmins();
      toast({
        title: "Admin Added",
        description: `${formData.name} has been added successfully`,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to add Admin",
        variant: "destructive",
      });
    }
  };

  const fetchUpdateAdmin = async (admin: Admins) => {
    try {
      const response = await fetch(BASE_URL + `/admins/${admin.id}`, {
        method: "PUT",
        body: JSON.stringify(admin),
        headers: {
          // accesstoken: "${token.access_token}",
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      dispatch(updateAdmin(res));
      fetchAdmins();
      toast({
        title: "Admin Updated",
        description: `${admin.name} has been updated successfully`,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to update Admin",
        variant: "destructive",
      });
    }
  };

  const fetchDeleteAdmin = async (admin: Admins) => {
    try {
      await fetch(BASE_URL + ` /admins/${admin.id}`, {
        method: "DELETE",
        headers: {
          // accesstoken: "${token.access_token}",
        },
      });
      dispatch(deleteAdmin(admin.id));
      fetchAdmins();
      toast({
        title: "Admin Deleted",
        description: `${admin.name} has been removed from the system`,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to delete Admin",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.position ||
      !formData.department
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (!editingAdmin) {
      // Only validate password fields when adding
      if (!formData.password || !formData.confirmPassword || !formData.role) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }
      if (formData.password.length < 6) {
        toast({
          title: "Weak password",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }
      fetchAddAdmins();
    } else {
      // Only send editable fields for update, set joinDate to current date
      const updatePayload = {
        ...editingAdmin,
        name: formData.name,
        email: formData.email,
        position: formData.position,
        department: formData.department,
        status: formData.status,
        joinDate: new Date().toISOString().split("T")[0],
      };
      fetchUpdateAdmin(updatePayload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (admin: Admins) => {
    fetchDeleteAdmin(admin);
  };

  const activeUsers = admins.filter((adm) => adm.status === "Active").length;
  const adminUsers = admins.filter((adm) =>
    adm.position.toLowerCase().includes("manager")
  ).length;

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold truncate">
                Admin Management
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your organization's Admins and their information
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Admins
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{admins.length}</div>
                <p className="text-xs text-muted-foreground">
                  Registered in system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Admins
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Manager Roles
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminUsers}</div>
                <p className="text-xs text-muted-foreground">
                  With elevated permissions
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl">
                    All Admins
                  </CardTitle>
                  <CardDescription className="text-sm">
                    View and manage Admin records ({admins.length} total)
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate">Add Admins</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAdmin ? "Edit Employee" : "Add New Employee"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAdmin
                          ? "Update Admin information below."
                          : "Enter the details for the new Admin."}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Enter full name"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            placeholder="Enter email address"
                          />
                        </div>
                        {!editingAdmin && (
                          <>
                            <div className="grid gap-2">
                              <Label htmlFor="password">Password</Label>
                              <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    password: e.target.value,
                                  })
                                }
                                placeholder="Enter password"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="confirmPassword">
                                Confirm Password
                              </Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                placeholder="Confirm password"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="role">Role</Label>
                              <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, role: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  {/* <SelectItem value="employee">Employee</SelectItem> */}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                        <div className="grid gap-2">
                          <Label htmlFor="role">Position</Label>
                          <Input
                            id="role"
                            value={formData.position}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                position: e.target.value,
                              })
                            }
                            placeholder="e.g., Senior Developer"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="department">Department</Label>
                          <Select
                            value={formData.department}
                            onValueChange={(value) =>
                              setFormData({ ...formData, department: value })
                            }
                          >
                            <SelectTrigger>
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
                        <Button type="submit">
                          {editingAdmin ? "Update Admin" : "Add Admin"}
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
                    placeholder="Search Admins..."
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
                      <TableHead className="min-w-[120px]">Name</TableHead>
                      <TableHead className="min-w-[180px] hidden sm:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="min-w-[120px]">Position</TableHead>
                      <TableHead className="min-w-[100px] hidden md:table-cell">
                        Department
                      </TableHead>
                      <TableHead className="min-w-[100px] hidden lg:table-cell">
                        Join Date
                      </TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="text-right min-w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {admin.name}
                            </div>
                            <div className="text-sm text-muted-foreground sm:hidden truncate">
                              {admin.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="truncate">{admin.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="truncate">{admin.position}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="truncate">{admin.department}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {new Date(admin.joinDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              admin.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                            className="shrink-0"
                          >
                            {admin.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(admin)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(admin)}
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
