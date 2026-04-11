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
  X,
  Loader2,
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
  setEmployeeLeaveBalances,
  type LeaveType,
  type EmployeeLeaveBalance,
} from "@/store/slices/leaveSlice";
import { setEmployees, type Employee } from "@/store/slices/employeeSlice";
import AdminAllocateModal from "./components/AdminAllocateModal";

export const LeaveAllocation = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { leaveTypes } = useAppSelector((state) => state.leave);
  const { employees } = useAppSelector((state) => state.employees);

  const [isAddingType, setIsAddingType] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [deletingType, setDeletingType] = useState<LeaveType | null>(null);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCount, setNewTypeCount] = useState("");

  const [isAllocatingStandalone, setIsAllocatingStandalone] = useState(false);
  const [allocatingEmployee, setAllocatingEmployee] = useState<{
    _id: string;
    name: string;
  } | null>(null);

  const getFinancialYears = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

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
  const [grantStatusMap, setGrantStatusMap] = useState<Record<string, boolean>>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGrantConfirmOpen, setIsGrantConfirmOpen] = useState(false);
  const [grantResult, setGrantResult] = useState<{
    success: boolean;
    message: string;
    processed: Array<{
      employeeId: string;
      employeeName: string;
      grantedTypes: string[];
      skippedTypes: string[];
    }>;
    failed: Array<{
      employeeId: string;
      error: string;
      errorCode?: string;
    }>;
  } | null>(null);

  const filteredEmployeesList = employees.filter(
    (emp) =>
      emp.position?.toLowerCase() !== "intern" &&
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [policiesPage, setPoliciesPage] = useState(1);
  const policiesPerPage = 5;
  const totalPoliciesPages = Math.max(
    1,
    Math.ceil(leaveTypes.length / policiesPerPage)
  );
  const currentPolicies = leaveTypes.slice(
    (policiesPage - 1) * policiesPerPage,
    policiesPage * policiesPerPage
  );

  const [employeePage, setEmployeePage] = useState(1);
  const employeesPerPage = 5;
  const totalEmployeePages = Math.max(
    1,
    Math.ceil(filteredEmployeesList.length / employeesPerPage)
  );
  const currentEmployees = filteredEmployeesList.slice(
    (employeePage - 1) * employeesPerPage,
    employeePage * employeesPerPage
  );

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
      const res = await apiRequest<{
        success: boolean;
        grantMap: Record<string, boolean>;
      }>(`/api/leave/admin/grant-status?year=${grantYear}`, { token });
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

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [typesRes, empsRes] = await Promise.all([
        apiRequest<{ success: boolean; leaveTypes: LeaveType[] }>(
          "/api/leave/types",
          { token }
        ),
        apiRequest<{ success: boolean; employees: Employee[] }>(
          "/api/admin/employees",
          { token }
        ),
      ]);
      if (typesRes.success) dispatch(setLeaveTypes(typesRes.leaveTypes));
      if (empsRes.success) dispatch(setEmployees(empsRes.employees));
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshGrantedEmployeeBalances = async (employeeIds: string[]) => {
    if (!token || employeeIds.length === 0) return;
    
    try {
      console.log(`🔄 Refreshing balances for ${employeeIds.length} granted employees...`);

      const balancePromises = employeeIds.map(async (empId) => {
        try {
          const res = await apiRequest<{ success: boolean; balances: EmployeeLeaveBalance[] }>(
            `/api/leave/balances?userId=${empId}&year=${grantYear}`,
            { token }
          );
          
          if (res.success) {
            const emp = employees.find(e => (e._id || e.id) === empId);
            console.log(`✅ Employee ${emp?.name || empId} balances:`, res.balances.length);
            return { employeeId: empId, balances: res.balances };
          }
          return null;
        } catch (error) {
          console.error(`❌ Error fetching balances for ${empId}:`, error);
          return null;
        }
      });

      const results = await Promise.all(balancePromises);
      const allBalances = results
        .filter((r): r is { employeeId: string; balances: EmployeeLeaveBalance[] } => r !== null)
        .flatMap((r) => r.balances);

      console.log(`📊 Total balances fetched:`, allBalances.length);
      
      dispatch(setEmployeeLeaveBalances(allBalances));
    } catch (error) {
      console.error("Failed to refresh employee balances:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, token]);

  const handleAddLeaveType = async () => {
    if (!newTypeName || !newTypeCount || !token) return;
    try {
      const res = await apiRequest<{ success: boolean; leaveType: LeaveType }>(
        "/api/leave/types",
        {
          method: "POST",
          body: {
            name: newTypeName,
            yearlyCount: parseInt(newTypeCount),
          },
          token,
        }
      );
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
      const res = await apiRequest<{ success: boolean; leaveType: LeaveType }>(
        `/api/leave/types/${editingType._id || editingType.id}`,
        {
          method: "PUT",
          body: {
            name: editingType.name,
            yearlyCount: editingType.yearlyCount,
            isActive: editingType.isActive,
          },
          token,
        }
      );
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
      const res = await apiRequest<{ success: boolean; message: string }>(
        `/api/leave/types/${id}`,
        {
          method: "DELETE",
          token,
        }
      );
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
    const filteredIds = filteredEmployeesList.map(
      (emp) => emp._id || emp.id || ""
    );
    if (checked) {
      setSelectedEmployees((prev) =>
        Array.from(new Set([...prev, ...filteredIds]))
      );
    } else {
      setSelectedEmployees((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    }
  };

  const handleSelectEmployee = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees((prev) => [...prev, id]);
    } else {
      setSelectedEmployees((prev) => prev.filter((empId) => empId !== id));
    }
  };

  const handleGrantLeaves = async () => {
    if (selectedEmployees.length === 0 || !token) {
      toast.error("Please select at least one employee");
      return;
    }

    setIsGranting(true);
    setGrantResult(null);

    try {
      const res = await apiRequest<{
        success: boolean;
        partialSuccess?: boolean;
        message: string;
        grantedCount?: number;
        skippedCount?: number;
        processedCount?: number;
        failedCount?: number;
        details?: {
          processed: Array<{
            employeeId: string;
            grantedTypes: string[];
            skippedTypes: string[];
          }>;
          failed: Array<{
            employeeId: string;
            error: string;
            errorCode?: string;
          }>;
        };
      }>("/api/leave/grant-yearly", {
        method: "POST",
        body: {
          year: grantYear,
          employeeIds: selectedEmployees,
        },
        token,
      });

      if (res.success) {
        const granted = res.grantedCount || 0;
        const skipped = res.skippedCount || 0;
        const processed = res.processedCount || 0;
        const failed = res.failedCount || 0;

        const processedWithNames = (res.details?.processed || []).map(p => {
          const emp = employees.find(e => (e._id || e.id) === p.employeeId);
          return {
            ...p,
            employeeName: emp?.name || 'Unknown'
          };
        });

        setGrantResult({
          success: !res.partialSuccess,
          message: res.message,
          processed: processedWithNames,
          failed: res.details?.failed || []
        });

        if (res.partialSuccess && failed > 0) {
          toast.warning(
            `Partially completed: Granted leaves to ${processed} employee(s), failed ${failed}`
          );
        } else if (granted > 0 && skipped > 0) {
          toast.success(
            `Granted leave balances to ${processed} employees (${granted} new, ${skipped} already granted)`
          );
        } else if (granted > 0) {
          toast.success(
            `Successfully granted leave balances to ${processed} employees`
          );
        } else {
          toast.info(
            `All ${skipped} employees already have leaves granted for ${grantYear}`
          );
        }

        setSelectedEmployees([]);
        await fetchGrantStatus();
        
        console.log('⏳ Waiting 500ms for database commit...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const processedEmployeeIds = res.details?.processed?.map(p => p.employeeId) || [];
        await refreshGrantedEmployeeBalances(processedEmployeeIds);
        
        try {
          localStorage.setItem('ems_leave_updated', Date.now().toString());
        } catch (e) {
          console.warn('Failed to update localStorage', e);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while granting leaves");
    } finally {
      setIsGranting(false);
      setIsGrantConfirmOpen(false);
    }
  };

  const getUngrantedCount = () => {
    return selectedEmployees.filter((empId) => !grantStatusMap[empId]).length;
  };

  const getAlreadyGrantedCount = () => {
    return selectedEmployees.filter((empId) => grantStatusMap[empId]).length;
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
              <Button variant="outline" onClick={() => setIsAddingType(false)}>
                Cancel
              </Button>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center pl-6 w-[80px]">
                        Sr. No.
                      </TableHead>
                      <TableHead className="text-center">Type</TableHead>
                      <TableHead className="text-center">
                        Days Per Year
                      </TableHead>
                      <TableHead className="text-center pr-6">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPolicies.map((type, index) => (
                      <TableRow key={type._id || type.id}>
                        <TableCell className="text-center pl-6 font-medium text-muted-foreground">
                          {(policiesPage - 1) * policiesPerPage + index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {type.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {type.yearlyCount}
                        </TableCell>
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
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No leave types defined. Click "Add Leave Type" to
                          create one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium">
                      {leaveTypes.length > 0
                        ? (policiesPage - 1) * policiesPerPage + 1
                        : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        policiesPage * policiesPerPage,
                        leaveTypes.length
                      )}
                    </span>{" "}
                    of <span className="font-medium">{leaveTypes.length}</span>{" "}
                    types
                  </div>
                  {totalPoliciesPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePoliciesPageChange(policiesPage - 1)
                        }
                        disabled={policiesPage === 1}
                        className="h-8 px-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPoliciesPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPoliciesPages <= 5) pageNum = i + 1;
                            else if (policiesPage <= 3) pageNum = i + 1;
                            else if (policiesPage >= totalPoliciesPages - 2)
                              pageNum = totalPoliciesPages - 4 + i;
                            else pageNum = policiesPage - 2 + i;

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  policiesPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handlePoliciesPageChange(pageNum)
                                }
                                className="h-8 w-8 p-0"
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
                          handlePoliciesPageChange(policiesPage + 1)
                        }
                        disabled={policiesPage === totalPoliciesPages}
                        className="h-8 px-2"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-2 overflow-hidden">
          <CardHeader className="bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Employee Allocation
              </CardTitle>
              <CardDescription>
                Select employees to grant yearly leave balances for the selected
                year.
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
                <Label
                  htmlFor="year-select"
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Year:
                </Label>
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
                onClick={() => setIsGrantConfirmOpen(true)}
                disabled={selectedEmployees.length === 0 || isGranting}
                className="h-9 shadow-md shadow-primary/10"
              >
                {isGranting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
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
              <div className="flex items-center gap-2">
                {selectedEmployees.length > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground">
                      {getUngrantedCount()} new, {getAlreadyGrantedCount()}{" "}
                      already granted
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEmployees([])}
                      className="h-7 text-xs hover:bg-primary/10"
                    >
                      Clear Selection
                    </Button>
                  </>
                )}
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px] text-center pl-6">
                        <Checkbox
                          checked={
                            filteredEmployeesList.length > 0 &&
                            filteredEmployeesList.every((emp) =>
                              selectedEmployees.includes(
                                emp._id || emp.id || ""
                              )
                            )
                          }
                          onCheckedChange={handleSelectAll}
                          className="h-5 w-5 rounded-none border-2 border-slate-300 data-[state=checked]:!bg-green-600 data-[state=checked]:!border-green-600"
                        />
                      </TableHead>
                      <TableHead className="text-center w-[80px]">
                        Sr. No.
                      </TableHead>
                      <TableHead className="text-center">Employee</TableHead>
                      <TableHead className="text-center">Position</TableHead>
                      <TableHead className="text-center">Department</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentEmployees.map((emp, index) => {
                      const empId = emp._id || emp.id || "";
                      const isGranted = grantStatusMap[empId];
                      return (
                        <TableRow
                          key={empId}
                          className={
                            selectedEmployees.includes(empId)
                              ? "bg-primary/5"
                              : "hover:bg-muted/50 transition-colors"
                          }
                        >
                          <TableCell className="text-center pl-6">
                            <Checkbox
                              checked={selectedEmployees.includes(empId)}
                              onCheckedChange={(checked) =>
                                handleSelectEmployee(empId, checked as boolean)
                              }
                              className="h-5 w-5 rounded-none border-2 border-slate-300 data-[state=checked]:!bg-green-600 data-[state=checked]:!border-green-600"
                            />
                          </TableCell>
                          <TableCell className="text-center font-medium text-muted-foreground">
                            {(employeePage - 1) * employeesPerPage + index + 1}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-medium">{emp.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {emp.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-center capitalize">
                            {emp.position}
                          </TableCell>
                          <TableCell className="text-center capitalize">
                            {emp.department}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center justify-center gap-1 ${
                                isGranted
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {isGranted ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  Granted
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3" />
                                  Not Granted
                                </>
                              )}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredEmployeesList.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                          No employees found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium">
                      {filteredEmployeesList.length > 0
                        ? (employeePage - 1) * employeesPerPage + 1
                        : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        employeePage * employeesPerPage,
                        filteredEmployeesList.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredEmployeesList.length}
                    </span>{" "}
                    employees
                  </div>
                  {totalEmployeePages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleEmployeePageChange(employeePage - 1)
                        }
                        disabled={employeePage === 1}
                        className="h-8 px-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalEmployeePages) },
                          (_, i) => {
                            let pageNum;
                            if (totalEmployeePages <= 5) pageNum = i + 1;
                            else if (employeePage <= 3) pageNum = i + 1;
                            else if (employeePage >= totalEmployeePages - 2)
                              pageNum = totalEmployeePages - 4 + i;
                            else pageNum = employeePage - 2 + i;

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  employeePage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleEmployeePageChange(pageNum)
                                }
                                className="h-8 w-8 p-0"
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
                          handleEmployeePageChange(employeePage + 1)
                        }
                        disabled={employeePage === totalEmployeePages}
                        className="h-8 px-2"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!editingType}
        onOpenChange={(open) => !open && setEditingType(null)}
      >
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
                  onChange={(e) =>
                    setEditingType({ ...editingType, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-count">Yearly Count (Days)</Label>
                <Input
                  id="edit-count"
                  type="number"
                  value={editingType.yearlyCount}
                  onChange={(e) =>
                    setEditingType({
                      ...editingType,
                      yearlyCount: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingType(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLeaveType}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingType}
        onOpenChange={(open) => !open && setDeletingType(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Leave Type
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingType?.name}</strong>? This action cannot be
              undone and may affect employee balances.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingType(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLeaveType}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGrantConfirmOpen} onOpenChange={setIsGrantConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Leave Grant</DialogTitle>
            <DialogDescription>
              You are about to grant yearly leave balances for{" "}
              <strong>{grantYear}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Selected:</span>
                <span className="font-medium">
                  {selectedEmployees.length} employees
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New Grants:</span>
                <span className="font-medium text-green-600">
                  {getUngrantedCount()} employees
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Already Granted (will skip):
                </span>
                <span className="font-medium text-yellow-600">
                  {getAlreadyGrantedCount()} employees
                </span>
              </div>
            </div>
            {getAlreadyGrantedCount() > 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  {getAlreadyGrantedCount()} employee(s) already have leave
                  balances for {grantYear}. They will be skipped.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGrantConfirmOpen(false)}
              disabled={isGranting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGrantLeaves}
              disabled={isGranting || getUngrantedCount() === 0}
            >
              {isGranting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isGranting ? "Granting..." : "Confirm & Grant Leaves"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={!!grantResult} 
        onOpenChange={(open) => !open && setGrantResult(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {grantResult?.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              Leave Grant Result
            </DialogTitle>
            <DialogDescription>
              {grantResult?.message}
            </DialogDescription>
          </DialogHeader>
          
          {grantResult && grantResult.processed.length > 0 && (
            <div className="space-y-4 py-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-50 px-4 py-2 border-b">
                  <h4 className="font-medium text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Successfully Processed ({grantResult.processed.length})
                  </h4>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {grantResult.processed.map((emp, idx) => (
                    <div key={emp.employeeId} className="px-4 py-3 border-b last:border-0 hover:bg-muted/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{idx + 1}. {emp.employeeName}</p>
                          {emp.grantedTypes.length > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Granted: {emp.grantedTypes.join(", ")}
                            </p>
                          )}
                          {emp.skippedTypes.length > 0 && (
                            <p className="text-xs text-yellow-600 mt-1">
                              ⊘ Skipped: {emp.skippedTypes.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {grantResult.failed.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-4 py-2 border-b">
                    <h4 className="font-medium text-red-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Failed ({grantResult.failed.length})
                    </h4>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {grantResult.failed.map((emp, idx) => (
                      <div key={emp.employeeId} className="px-4 py-3 border-b last:border-0 bg-red-50/50">
                        <p className="text-sm font-medium text-red-700">
                          {idx + 1}. Employee ID: {emp.employeeId}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Error: {emp.error}
                        </p>
                        {emp.errorCode && (
                          <p className="text-xs text-red-500 mt-1">
                            Code: {emp.errorCode}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setGrantResult(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminAllocateModal
        isOpen={isAllocatingStandalone}
        onClose={() => {
          setIsAllocatingStandalone(false);
          setAllocatingEmployee(null);
        }}
        employee={allocatingEmployee}
        onSuccess={() => {
          fetchGrantStatus();
        }}
      />
    </div>
  );
};
