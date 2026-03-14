import { useState, useEffect } from "react";
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
  AlertCircle
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
  type LeaveType
} from "@/store/slices/leaveSlice";
import { setEmployees, type Employee } from "@/store/slices/employeeSlice";

export const LeaveAllocation = () => {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const { leaveTypes } = useAppSelector((state) => state.leave);
  const { employees } = useAppSelector((state) => state.employees);

  const [isAddingType, setIsAddingType] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCount, setNewTypeCount] = useState("");
  
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [grantYear, setGrantYear] = useState(new Date().getFullYear().toString());
  const [isGranting, setIsGranting] = useState(false);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(employees.map(emp => emp._id || emp.id || ""));
    } else {
      setSelectedEmployees([]);
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
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while granting leaves");
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Leave Allocation
        </h2>
        <p className="text-muted-foreground text-lg">
          Configure leave types and grant yearly balances to employees.
        </p>
      </div>

      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Leave Management</h2>
          <p className="text-muted-foreground">Configure leave types and grant yearly balances.</p>
        </div>
        <Dialog open={isAddingType} onOpenChange={setIsAddingType}>
          <DialogTrigger asChild>
            <Button className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 shadow-sm border-2">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center">
              <Settings2 className="h-5 w-5 mr-2 text-primary" />
              Leave Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Days/Yr</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes.map((type) => (
                  <TableRow key={type._id || type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="text-right">{type.yearlyCount}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingType(type)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {leaveTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No leave types defined.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-2 overflow-hidden">
          <CardHeader className="bg-muted/30 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Employee Allocation
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="year-select" className="text-sm font-medium">Year:</Label>
                <Select value={grantYear} onValueChange={setGrantYear}>
                  <SelectTrigger id="year-select" className="w-[120px] h-9">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleGrantLeaves} 
                disabled={selectedEmployees.length === 0 || isGranting}
                className="h-9"
              >
                {isGranting ? "Granting..." : "Grant Yearly Leaves"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-primary/5 px-4 py-2 flex items-center justify-between border-b">
              <span className="text-sm font-medium text-primary flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {selectedEmployees.length} employees selected
              </span>
              {selectedEmployees.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedEmployees([])} className="h-7 text-xs">
                  Clear Selection
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={selectedEmployees.length === employees.length && employees.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Join Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => {
                  const empId = emp._id || emp.id || "";
                  return (
                    <TableRow key={empId} className={selectedEmployees.includes(empId) ? "bg-primary/5" : ""}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedEmployees.includes(empId)}
                          onCheckedChange={(checked) => handleSelectEmployee(empId, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.email}</div>
                      </TableCell>
                      <TableCell className="capitalize">{emp.position}</TableCell>
                      <TableCell className="capitalize">{emp.department}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{emp.joinDate}</TableCell>
                    </TableRow>
                  );
                })}
                {employees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
    </div>
  );
};
