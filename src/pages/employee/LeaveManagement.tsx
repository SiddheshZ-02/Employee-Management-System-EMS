import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { type LeaveRequest } from "@/store/slices/leaveSlice";
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

interface LeaveFormData {
  type: "vacation" | "sick" | "casual" | "other";
  startDate: string;
  endDate: string;
  reason: string;
}

const LeaveManagement = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const { balances } = useAppSelector((state) => state.leave);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leave, setLeave] = useState<LeaveRequest[]>([]);

  const form = useForm<LeaveFormData>({
    defaultValues: {
      type: "vacation",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  const fetchLeave = useCallback(async () => {
    try {
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/leave/my-requests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const res = (await response.json()) as {
        success: boolean;
        leaveRequests: {
          _id: string;
          userId: string;
          startDate: string;
          endDate: string;
          totalDays?: number;
          reason: string;
          leaveType: string;
          status: string;
          createdAt?: string;
          approvedBy?: {
            name?: string;
            email?: string;
          } | null;
        }[];
      };

      if (!res.success || !Array.isArray(res.leaveRequests)) {
        return;
      }

      const mapped: LeaveRequest[] = res.leaveRequests.map((r) => ({

        id: r._id,
        employeeId: r.userId,
        employeeName: user?.name || "",
        type:
          r.leaveType === "vacation"
            ? "Vacation"
            : r.leaveType === "sick"
            ? "Sick"
            : r.leaveType === "casual"
            ? "Casual"
            : "Other",
        startDate: format(new Date(r.startDate), "yyyy-MM-dd"),
        endDate: format(new Date(r.endDate), "yyyy-MM-dd"),
        days: r.totalDays || 0,
        reason: r.reason,
        status:
          r.status === "approved"
            ? "Approved"
            : r.status === "rejected"
            ? "Rejected"
            : r.status === "cancelled"
            ? "Rejected"
            : "Pending",
        submittedAt: r.createdAt || "",
        approvedByName: r.approvedBy?.name || "",
        approvedByEmail: r.approvedBy?.email || "",
      }));

      setLeave(mapped);
    } catch {
      console.error(
        "Error fetching leave data:",
        new Error("Failed to fetch leave data")
      );
    }
  }, [token, user?.name]);

  useEffect(() => {
    fetchLeave();
  }, [fetchLeave]);

  // Submit leave request to API
  const onSubmit = async (data: LeaveFormData) => {
    if (!token) {
      toast({
        title: "Not authenticated",
        description: "Please log in again to submit a leave request.",
        variant: "destructive",
      });
      return;
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    try {
      const leaveType = data.type;

      const response = await fetch(`${API_BASE_URL}/leave/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
          leaveType,
        }),
      });
      if (response.ok) {
        toast({
          title: "Leave Request Submitted",
          description: `Your ${data.type.toLowerCase()} request for ${days} days has been submitted for approval.`,
        });
        form.reset();
        setDialogOpen(false);
        fetchLeave();
      } else {
        toast({ title: "Failed to submit leave request" });
      }
    } catch {
      toast({ title: "Error submitting leave request" });
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/leave/request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.ok) {
        toast({
          title: "Leave Request Cancelled",
          description: "Your leave request has been cancelled successfully.",
        });
        fetchLeave();
      } else {
        toast({ title: "Failed to cancel leave request" });
      }
    } catch {
      toast({ title: "Error cancelling leave request" });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default";
      case "Rejected":
        return "destructive";
      case "Pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Vacation":
        return "text-blue-600";
      case "Sick":
        return "text-red-600";
      case "Casual":
        return "text-green-600";
      case "Other":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const pendingLeave = leave.filter((r) => r.status === "Pending");
  const approvedLeave = leave.filter((r) => r.status === "Approved");
  const [activeTab, setActiveTab] = useState<"Pending" | "Approved">("Pending");
  const activeList = activeTab === "Pending" ? pendingLeave : approvedLeave;

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
                      name="type"
                      rules={{ required: "Leave type is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leave Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select leave type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="vacation">Vacation</SelectItem>
                              <SelectItem value="sick">Sick Leave</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
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
                              <Input type="date" {...field} />
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
                              <Input type="date" {...field} />
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
            {Object.entries(balances).map(([type, balance]) => (
              <Card
                key={type}
                className="hover-lift transition-smooth border-border/50"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground capitalize truncate">
                    {type} Leave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-2xl font-bold text-foreground">
                        {balance.remaining}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        of {balance.total} days
                      </div>
                    </div>
                    <CalendarDays
                      className={`h-5 w-5 ${getTypeColor(type)} shrink-0`}
                    />
                  </div>
                  <div className="mt-3 w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(balance.remaining / balance.total) * 100}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Leave Requests */}
          <Card className="hover-lift transition-smooth border-border/50">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>My Leave Requests</CardTitle>
                  <CardDescription>
                    View your pending and approved leave requests.
                  </CardDescription>
                </div>
                <div className="inline-flex items-center rounded-md border border-border/60 p-1 bg-background">
                  <Button
                    type="button"
                    variant={activeTab === "Pending" ? "default" : "ghost"}
                    size="sm"
                    className="px-3"
                    onClick={() => setActiveTab("Pending")}
                  >
                    Pending
                  </Button>
                  <Button
                    type="button"
                    variant={activeTab === "Approved" ? "default" : "ghost"}
                    size="sm"
                    className="px-3"
                    onClick={() => setActiveTab("Approved")}
                  >
                    Approved
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeList.length > 0 ? (
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Type</TableHead>
                        <TableHead className="whitespace-nowrap">Dates</TableHead>
                        <TableHead className="whitespace-nowrap">Days</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">
                          {activeTab === "Pending" ? "Submitted" : "Approved On"}
                        </TableHead>
                        {activeTab === "Approved" && (
                          <TableHead className="whitespace-nowrap">
                            Approved By
                          </TableHead>
                        )}
                        {activeTab === "Pending" && (
                          <TableHead className="text-right whitespace-nowrap">
                            Actions
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeList.map((request) => (
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
                            {activeTab === "Approved" && (
                              <TableCell>
                                <span className="text-sm text-muted-foreground truncate">
                                  {request.approvedByName || "N/A"}
                                </span>
                              </TableCell>
                            )}
                            {activeTab === "Pending" && (
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancel(request.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center space-y-4 py-8 text-sm text-muted-foreground">
                  <p>
                    {activeTab === "Pending"
                      ? "No pending leave requests."
                      : "No approved leave requests yet."}
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
