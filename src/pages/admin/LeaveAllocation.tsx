import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Plus, 
  Edit2, 
  Users, 
  Settings2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { 
  setLeaveTypes, 
  addLeaveType as addLeaveTypeAction, 
  updateLeaveType as updateLeaveTypeAction,
  removeLeaveType as removeLeaveTypeAction,
  type LeaveType
} from "@/store/slices/leaveSlice";
import { setEmployees, type Employee } from "@/store/slices/employeeSlice";

export const LeaveAllocation = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const { leaveTypes } = useAppSelector((state) => state.leave);
  const { employees } = useAppSelector((state) => state.employees);

  const [isAddingType, setIsAddingType] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [deletingType, setDeletingType] = useState<LeaveType | null>(null);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCount, setNewTypeCount] = useState("");
  
  const getFinancialYears = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    
    // Indian Financial Year: April 1 to March 31
    // If current month is before April (0, 1, 2), then the financial year is (currentYear - 1) to (currentYear)
    // If current month is April or after (3-11), then the financial year is (currentYear) to (currentYear + 1)
    let startYear = currentMonth < 3 ? currentYear - 1 : currentYear;
    
    const years = [];
    for (let i = 0; i < 3; i++) {
      years.push(`${startYear + i}-${startYear + i + 1}`);
    }
    return years;
  };

  const financialYears = getFinancialYears();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [grantYear, setGrantYear] = useState(financialYears[0]);
  const [isGranting, setIsGranting] = useState(false);
  const [grantStatusMap, setGrantStatusMap] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Filter employees (exclude interns and filter by name)
  const filteredEmployeesList = employees.filter(emp => 
    emp.position?.toLowerCase() !== "intern" &&
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination state for Leave Policies
  const [policiesPage, setPoliciesPage] = useState(1);
  const policiesPerPage = 5;
  const totalPoliciesPages = Math.max(1, Math.ceil(leaveTypes.length / policiesPerPage));
  const currentPolicies = leaveTypes.slice((policiesPage - 1) * policiesPerPage, policiesPage * policiesPerPage);

  // Pagination state for Employee Allocation
  const [employeePage, setEmployeePage] = useState(1);
  const employeesPerPage = 5;
  const totalEmployeePages = Math.max(1, Math.ceil(filteredEmployeesList.length / employeesPerPage));
  const currentEmployees = filteredEmployeesList.slice((employeePage - 1) * employeesPerPage, employeePage * employeesPerPage);

  const handlePoliciesPageChange = (page: number) => {
    setPoliciesPage(page);
  };

  const handleEmployeePageChange = (page: number) => {
    setEmployeePage(page);
  };

  useEffect(() => {
    setEmployeePage(1);
  }, [searchTerm]);

  const fetchGrantStatus = async () => {
    if (!token || !grantYear) return;
    try {
      const res = await apiRequest<{ success: boolean; grantMap: Record<string, boolean> }>(
        `/api/leave/admin/grant-status?year=${grantYear}`, 
        { token }
      );
      if (res.success) {
        setGrantStatusMap(res.grantMap);
      }
    } catch (error) {
      console.error("Failed to fetch grant status", error);
    }
  };

  useEffect(() => {
    fetchGrantStatus();
  }, [grantYear, token]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [typesRes, empsRes] = await Promise.all([
          apiRequest<{ success: boolean; leaveTypes: LeaveType[] }>("/api/leave/types", { token }),
          apiRequest<{ success: boolean; employees: Employee[] }>("/api/admin/employees", { token })
        ]);
        if (typesRes.success) dispatch(setLeaveTypes(typesRes.leaveTypes));
        if (empsRes.success) dispatch(setEmployees(empsRes.employees));
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    };
    fetchData();
  }, [dispatch, token]);

  const handleAddLeaveType = async () => {
    if (!newTypeName || !newTypeCount || !token) return;
    try {
      const res = await apiRequest<{ success: boolean; leaveType: LeaveType }>("/api/leave/types", {
        method: "POST",
        body: {
          name: newTypeName,
          yearlyCount: parseInt(newTypeCount)
        },
        token
      });
      if (res.success) {
        dispatch(addLeaveTypeAction(res.leaveType));
        setNewTypeName("");
        setNewTypeCount("");
        setIsAddingType(false);
        toast.success("Leave type added successfully");
      }
    } catch (error) {
      toast.error("Failed to add leave type");
    }
  };

  const handleUpdateLeaveType = async () => {
    if (!editingType || !token) return;
    try {
      const res = await apiRequest<{ success: boolean; leaveType: LeaveType }>(`/api/leave/types/${editingType._id || editingType.id}`, {
        method: "PUT",
        body: {
          name: editingType.name,
          yearlyCount: editingType.yearlyCount,
          isActive: editingType.isActive
        },
        token
      });
      if (res.success) {
        dispatch(updateLeaveTypeAction(res.leaveType));
        setEditingType(null);
        toast.success("Leave type updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update leave type");
    }
  };

  const handleDeleteLeaveType = async () => {
    if (!deletingType || !token) return;
    try {
      const id = deletingType._id || deletingType.id;
      const res = await apiRequest<{ success: boolean; message: string }>(`/api/leave/types/${id}`, {
        method: "DELETE",
        token
      });
      if (res.success) {
        dispatch(removeLeaveTypeAction(id as string));
        setDeletingType(null);
        toast.success(res.message || "Leave type deleted successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete leave type");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const filteredIds = filteredEmployeesList.map(emp => emp._id || emp.id || "");
    if (checked) {
      setSelectedEmployees(prev => Array.from(new Set([...prev, ...filteredIds])));
    } else {
      setSelectedEmployees(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  const handleSelectEmployee = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, id]);
    } else {
      setSelectedEmployees(prev => prev.filter(empId => empId !== id));
    }
  };

  const handleGrantLeaves = async () => {
    if (selectedEmployees.length === 0 || !token) {
      toast.error("Please select at least one employee");
      return;
    }
    
    setIsGranting(true);

    try {
      const res = await apiRequest<{ success: boolean; message: string }>("/api/leave/grant-yearly", {
        method: "POST",
        body: {
          year: grantYear,
          employeeIds: selectedEmployees
        },
        token
      });

      if (res.success) {
        toast.success(res.message || "Leaves granted successfully.");
        setSelectedEmployees([]);
        fetchGrantStatus();
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while granting leaves");
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 border shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Leave Allocation
            </h2>
            <p className="text-muted-foreground text-md">
              Configure leave types and grant yearly balances to employees.
            </p>
          </div>
        </div>

        <Dialog open={isAddingType} onOpenChange={setIsAddingType}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Plus className="h-5 w-5 mr-2" />
              Add Leave Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Leave Type</DialogTitle>
              <DialogDescription>
                Create a new leave category with its standard yearly allowance.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Leave Type Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Casual Leave" 
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="count">Yearly Count (Days)</Label>
                <Input 
                  id="count" 
                  type="number" 
                  placeholder="12" 
                  value={newTypeCount}
                  onChange={(e) => setNewTypeCount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingType(false)}>Cancel</Button>
              <Button onClick={handleAddLeaveType}>Add Leave Type</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        <Card className="shadow-sm border-2">
          <CardHeader className="bg-muted/90">
            <CardTitle className="text-lg flex items-center">
              <Settings2 className="h-5 w-5 mr-2 text-primary" />
              Leave Policies
            </CardTitle>
            <CardDescription>
              Manage different types of leaves and their yearly allocations.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center pl-6 w-[80px]">Sr. No.</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Days Per Year</TableHead>
                  <TableHead className="text-center pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPolicies.map((type, index) => (
                  <TableRow key={type._id || type.id}>
                    <TableCell className="text-center pl-6 font-medium text-muted-foreground">
                      {(policiesPage - 1) * policiesPerPage + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-center">{type.name}</TableCell>
                    <TableCell className="text-center">{type.yearlyCount}</TableCell>
                    <TableCell className="text-center pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingType(type)}
                          className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeletingType(type)}
                          className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {leaveTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No leave types defined. Click "Add Leave Type" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Leave Policies Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{leaveTypes.length > 0 ? (policiesPage - 1) * policiesPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(policiesPage * policiesPerPage, leaveTypes.length)}</span> of <span className="font-medium">{leaveTypes.length}</span> types
              </div>
              {totalPoliciesPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePoliciesPageChange(policiesPage - 1)}
                    disabled={policiesPage === 1}
                    className="h-8 px-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPoliciesPages) }, (_, i) => {
                      let pageNum;
                      if (totalPoliciesPages <= 5) pageNum = i + 1;
                      else if (policiesPage <= 3) pageNum = i + 1;
                      else if (policiesPage >= totalPoliciesPages - 2) pageNum = totalPoliciesPages - 4 + i;
                      else pageNum = policiesPage - 2 + i;

                      return (
                        <Button
                          key={pageNum}
                          variant={policiesPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePoliciesPageChange(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePoliciesPageChange(policiesPage + 1)}
                    disabled={policiesPage === totalPoliciesPages}
                    className="h-8 px-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section: Employee Allocation */}
        <Card className="shadow-sm border-2 overflow-hidden">
          <CardHeader className="bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Employee Allocation
              </CardTitle>
              <CardDescription>
                Select employees to grant yearly leave balances for the selected year.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-8 h-9"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="year-select" className="text-sm font-medium whitespace-nowrap">Year:</Label>
                <Select value={grantYear} onValueChange={setGrantYear}>
                  <SelectTrigger id="year-select" className="w-[150px] h-9">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {financialYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleGrantLeaves} 
                disabled={selectedEmployees.length === 0 || isGranting}
                className="h-9 shadow-md shadow-primary/10"
              >
                {isGranting ? "Granting..." : "Grant Yearly Leaves"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-primary/5 px-6 py-3 flex items-center justify-between border-b">
              <span className="text-sm font-medium text-primary flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {selectedEmployees.length} employees selected for {grantYear}
              </span>
              {selectedEmployees.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedEmployees([])} className="h-7 text-xs hover:bg-primary/10">
                  Clear Selection
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center pl-6">
                    <Checkbox 
                      checked={filteredEmployeesList.length > 0 && filteredEmployeesList.every(emp => selectedEmployees.includes(emp._id || emp.id || ""))}
                      onCheckedChange={handleSelectAll}
                      className="h-5 w-5 rounded-none border-2 border-slate-300 data-[state=checked]:!bg-green-600 data-[state=checked]:!border-green-600"
                    />
                  </TableHead>
                  <TableHead className="text-center w-[80px]">Sr. No.</TableHead>
                  <TableHead className="text-center">Employee</TableHead>
                  <TableHead className="text-center">Position</TableHead>
                  <TableHead className="text-center">Department</TableHead>
                  <TableHead className="text-center pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEmployees.map((emp, index) => {
                  const empId = emp._id || emp.id || "";
                  return (
                    <TableRow key={empId} className={selectedEmployees.includes(empId) ? "bg-primary/5" : "hover:bg-muted/50 transition-colors"}>
                      <TableCell className="text-center pl-6">
                        <Checkbox 
                          checked={selectedEmployees.includes(empId)}
                          onCheckedChange={(checked) => handleSelectEmployee(empId, checked as boolean)}
                          className="h-5 w-5 rounded-none border-2 border-slate-300 data-[state=checked]:!bg-green-600 data-[state=checked]:!border-green-600"
                        />
                      </TableCell>
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {(employeePage - 1) * employeesPerPage + index + 1}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.email}</div>
                      </TableCell>
                      <TableCell className="text-center capitalize">{emp.position}</TableCell>
                      <TableCell className="text-center capitalize">{emp.department}</TableCell>
                      <TableCell className="text-center pr-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          grantStatusMap[empId] ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {grantStatusMap[empId] ? "Granted" : "Not Granted"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredEmployeesList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Employee Allocation Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{filteredEmployeesList.length > 0 ? (employeePage - 1) * employeesPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(employeePage * employeesPerPage, filteredEmployeesList.length)}</span> of <span className="font-medium">{filteredEmployeesList.length}</span> employees
              </div>
              {totalEmployeePages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEmployeePageChange(employeePage - 1)}
                    disabled={employeePage === 1}
                    className="h-8 px-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalEmployeePages) }, (_, i) => {
                      let pageNum;
                      if (totalEmployeePages <= 5) pageNum = i + 1;
                      else if (employeePage <= 3) pageNum = i + 1;
                      else if (employeePage >= totalEmployeePages - 2) pageNum = totalEmployeePages - 4 + i;
                      else pageNum = employeePage - 2 + i;

                      return (
                        <Button
                          key={pageNum}
                          variant={employeePage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleEmployeePageChange(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEmployeePageChange(employeePage + 1)}
                    disabled={employeePage === totalEmployeePages}
                    className="h-8 px-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingType} onOpenChange={(open) => !open && setEditingType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Leave Type</DialogTitle>
          </DialogHeader>
          {editingType && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Leave Type Name</Label>
                <Input 
                  id="edit-name" 
                  value={editingType.name}
                  onChange={(e) => setEditingType({...editingType, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-count">Yearly Count (Days)</Label>
                <Input 
                  id="edit-count" 
                  type="number" 
                  value={editingType.yearlyCount}
                  onChange={(e) => setEditingType({...editingType, yearlyCount: parseInt(e.target.value)})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingType(null)}>Cancel</Button>
            <Button onClick={handleUpdateLeaveType}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingType} onOpenChange={(open) => !open && setDeletingType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Leave Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingType?.name}</strong>? This action cannot be undone and may affect employee balances.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingType(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteLeaveType}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
