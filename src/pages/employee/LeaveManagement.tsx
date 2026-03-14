import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { 
  type LeaveRequest, 
  type LeaveType, 
  type EmployeeLeaveBalance,
  setLeaveTypes,
  setEmployeeLeaveBalances
} from "@/store/slices/leaveSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useForm } from "react-hook-form";
import { Plus, X, CalendarDays, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { API_BASE_URL } from "@/constant/Config";
import { apiRequest } from "@/lib/api";

interface LeaveFormData {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  payType: "paid" | "unpaid";
}

const LeaveManagement = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { leaveTypes, employeeLeaveBalances } = useAppSelector((state) => state.leave);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  const form = useForm<LeaveFormData>({
    defaultValues: {
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
      payType: "paid",
    },
  });

  const selectedStartDate = form.watch("startDate");
  const selectedEndDate = form.watch("endDate");
  const selectedLeaveTypeId = form.watch("leaveTypeId");
  
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diff = e.getTime() - s.getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const requestedDays = calculateDays(selectedStartDate, selectedEndDate);

  const getRemainingDays = (typeId: string) => {
    const balance = employeeLeaveBalances.find(b => {
      const bTypeId = b.leaveTypeId?._id || b.leaveTypeId?.id || b.leaveTypeId;
      return bTypeId === typeId;
    });
    return balance ? balance.remainingDays : 0;
  };

  const hasEnoughBalance = (typeId: string, days: number) => {
    return getRemainingDays(typeId) >= days;
  };

  // Automatically suggest payment type based on balance
  useEffect(() => {
    if (selectedLeaveTypeId) {
      const remaining = getRemainingDays(selectedLeaveTypeId);
      if (remaining <= 0) {
        // Force unpaid if no balance
        form.setValue("payType", "unpaid");
      } else if (requestedDays > 0 && remaining < requestedDays) {
        // Suggest unpaid if balance is not enough for requested days
        form.setValue("payType", "unpaid");
      } else if (!form.getValues("payType")) {
        // Default to paid if balance is enough and no selection made
        form.setValue("payType", "paid");
      }
    }
  }, [selectedLeaveTypeId, requestedDays, employeeLeaveBalances, form]);

  const fetchData = useCallback(async () => {
    try {
      if (!token) return;

      const [typesRes, balancesRes, requestsRes] = await Promise.all([
        apiRequest<{ success: boolean; leaveTypes: LeaveType[] }>("/api/leave/types", { token }),
        apiRequest<{ success: boolean; balances: EmployeeLeaveBalance[] }>("/api/leave/balances", { token }),
        apiRequest<{ success: boolean; leaveRequests: any[] }>("/api/leave/my-requests", { token })
      ]);

      if (typesRes.success) dispatch(setLeaveTypes(typesRes.leaveTypes));
      if (balancesRes.success) dispatch(setEmployeeLeaveBalances(balancesRes.balances));
      
      if (requestsRes.success && Array.isArray(requestsRes.leaveRequests)) {
        const mapped: LeaveRequest[] = requestsRes.leaveRequests.map((r) => ({
          id: r._id,
          employeeId: r.userId,
          employeeName: user?.name || "",
          type: r.leaveType,
          startDate: format(new Date(r.startDate), "yyyy-MM-dd"),
          endDate: format(new Date(r.endDate), "yyyy-MM-dd"),
          days: r.totalDays || 0,
          reason: r.reason,
          payType: r.payType || "paid",
          status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
          submittedAt: r.createdAt || "",
          approvedByName: r.approvedBy?.name || "",
          approvedByEmail: r.approvedBy?.email || "",
        }));
        setLeaveRequests(mapped);
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);
    }
  }, [token, user?.name, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data: LeaveFormData) => {
    if (!token) return;
    
    // Final check for payType to ensure consistency with balance
    let finalPayType = data.payType;
    const remaining = getRemainingDays(data.leaveTypeId);
    if (remaining <= 0) {
      finalPayType = "unpaid";
    } else if (finalPayType === "paid" && requestedDays > 0 && remaining < requestedDays) {
      // If user still has 'paid' selected but requested more days than available
      // we could either force it to unpaid or let the backend handle it.
      // Given the user's feedback, forcing to unpaid if balance is 0 is most important.
    }

    try {
      const res = await apiRequest<{ success: boolean; message: string }>("/api/leave/request", {
        method: "POST",
        body: {
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
          leaveTypeId: data.leaveTypeId,
          payType: finalPayType,
        },
        token
      });

      if (res.success) {
        toast({
          title: "Leave Request Submitted",
          description: "Your request has been submitted for approval.",
        });
        form.reset();
        setDialogOpen(false);
        fetchData();
      }
    } catch (error: any) {
      toast({ 
        title: "Failed to submit leave request",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!token) return;
    try {
      const res = await apiRequest<{ success: boolean }>("/api/leave/request/" + requestId, {
        method: "DELETE",
        token
      });
      if (res.success) {
        toast({
          title: "Leave Request Cancelled",
          description: "Your leave request has been cancelled successfully.",
        });
        fetchData();
      }
    } catch (error: any) {
      toast({ 
        title: "Failed to cancel leave request",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('sick')) return "text-red-600";
    if (t.includes('casual')) return "text-green-600";
    if (t.includes('vacation') || t.includes('earned')) return "text-blue-600";
    return "text-purple-600";
  };

  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredRequests = leaveRequests.filter((r) => {
    if (statusFilter === "All") return true;
    return r.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                Leave Management
              </h2>
              <p className="text-muted-foreground mt-2">
                Request time off and manage your leave balance.
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Request Leave</span>
                  <span className="sm:hidden">Request</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit Leave Request</DialogTitle>
                  <DialogDescription>
                    Fill in the details for your leave request. Your manager
                    will be notified for approval.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="leaveTypeId"
                      rules={{ required: "Leave type is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leave Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select leave type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {leaveTypes.filter(t => t.isActive).map(type => (
                                <SelectItem key={type._id || type.id} value={type._id || type.id || ""}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="payType"
                      rules={{ required: "Payment type is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedLeaveTypeId}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem 
                                value="paid" 
                                disabled={selectedLeaveTypeId ? getRemainingDays(selectedLeaveTypeId) <= 0 : false}
                              >
                                Paid Leave
                              </SelectItem>
                              <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          {selectedLeaveTypeId && (
                            <div className="space-y-1 mt-1">
                              {getRemainingDays(selectedLeaveTypeId) <= 0 ? (
                                <p className="text-xs text-amber-600 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Insufficient balance. Only unpaid leave available.
                                </p>
                              ) : requestedDays > 0 && getRemainingDays(selectedLeaveTypeId) < requestedDays && (
                                <p className="text-xs text-amber-600 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Not enough balance for {requestedDays} days. Suggesting unpaid leave.
                                </p>
                              )}
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        rules={{ required: "Start date is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                onClick={(e) => {
                                  try {
                                    e.currentTarget.showPicker();
                                  } catch (err) {
                                    console.debug("showPicker not supported or failed", err);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        rules={{ required: "End date is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                onClick={(e) => {
                                  try {
                                    e.currentTarget.showPicker();
                                  } catch (err) {
                                    console.debug("showPicker not supported or failed", err);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="reason"
                      rules={{ required: "Reason is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide a brief reason for your leave..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col-reverse sm:flex-row justify-end space-y-reverse space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="w-full sm:w-auto">
                        Submit Request
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Leave Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {employeeLeaveBalances.map((balance) => (
              <Card
                key={balance._id || balance.id}
                className="hover-lift transition-smooth border-border/50"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground capitalize truncate">
                    {balance.leaveTypeId?.name || "Leave"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-2xl font-bold text-foreground">
                        {balance.remainingDays}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        of {balance.allocatedDays} days
                      </div>
                    </div>
                    <CalendarDays
                      className={`h-5 w-5 ${getTypeColor(balance.leaveTypeId?.name || "")} shrink-0`}
                    />
                  </div>
                  <div className="mt-3 w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(balance.remainingDays / balance.allocatedDays) * 100}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {employeeLeaveBalances.length === 0 && (
              <div className="col-span-full py-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                No leave balances allocated for the current year.
              </div>
            )}
          </div>

          {/* Leave Requests */}
          <Card className="hover-lift transition-smooth border-border/50">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>My Leave Requests</CardTitle>
                  <CardDescription>
                    View your pending, approved, and rejected leave requests.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] h-9">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Requests</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRequests.length > 0 ? (
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Type</TableHead>
                        <TableHead className="whitespace-nowrap">Pay Type</TableHead>
                        <TableHead className="whitespace-nowrap">Dates</TableHead>
                        <TableHead className="whitespace-nowrap">Days</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Submitted</TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <CalendarDays
                                  className={`h-4 w-4 ${getTypeColor(
                                    request.type
                                  )} shrink-0`}
                                />
                                <span className="font-medium text-foreground truncate">
                                  {request.type}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {request.payType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="truncate">
                                  {request.startDate} -
                                </div>
                                <div className="text-muted-foreground truncate">
                                  {request.endDate}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-foreground">
                                {request.days}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(request.status)}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {request.submittedAt &&
                                !isNaN(new Date(request.submittedAt).getTime())
                                  ? format(
                                      new Date(request.submittedAt),
                                      "dd/MM/yyyy"
                                    )
                                  : "N/A"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {request.status.toLowerCase() === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancel(request.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center space-y-4 py-8 text-sm text-muted-foreground">
                  <p>
                    {statusFilter === "All" 
                      ? "No leave requests found." 
                      : `No ${statusFilter.toLowerCase()} leave requests found.`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="hover-lift transition-smooth border-border/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="truncate">Quick Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex">
                  <span className="shrink-0 mr-2">•</span>
                  <span>
                    Submit leave requests at least 2 weeks in advance for
                    vacation
                  </span>
                </li>
                <li className="flex">
                  <span className="shrink-0 mr-2">•</span>
                  <span>
                    Sick leave can be used immediately but requires
                    documentation for 3+ days
                  </span>
                </li>
                <li className="flex">
                  <span className="shrink-0 mr-2">•</span>
                  <span>
                    Personal leave requests are subject to manager approval and
                    business needs
                  </span>
                </li>
                <li className="flex">
                  <span className="shrink-0 mr-2">•</span>
                  <span>
                    Unused vacation days expire at the end of the fiscal year
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
