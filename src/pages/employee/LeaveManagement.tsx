import { useState, useEffect } from "react";
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
import { Calendar, Plus, X, CalendarDays, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { BASE_URL } from "@/constant/Config";

interface LeaveFormData {
  type: "Vacation" | "Sick" | "Personal" | "Maternity" | "Paternity";
  startDate: string;
  endDate: string;
  reason: string;
}

const LeaveManagement = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { balances } = useAppSelector((state) => state.leave);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leave, setLeave] = useState<LeaveRequest[]>([]);

  const form = useForm<LeaveFormData>({
    defaultValues: {
      type: "Vacation",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  // Fetch leave requests from API
  const fetchLeave = async () => {
    try {
      const response = await fetch(BASE_URL + `/leaves`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const res = await response.json();
      setLeave(res);
    } catch (error) {
      console.error("Error fetching leave data:", error);
    }
  };

  useEffect(() => {
    fetchLeave();
  }, []);

  // Submit leave request to API
  const onSubmit = async (data: LeaveFormData) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    const newRequest = {
      employeeId: user?.id || "",
      employeeName: user?.name || "",
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      days,
      reason: data.reason,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(BASE_URL + `/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRequest),
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
    } catch (error) {
      toast({ title: "Error submitting leave request" });
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      const response = await fetch(
        BASE_URL + `/leaves/${requestId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
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
    } catch (error) {
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
      case "Personal":
        return "text-green-600";
      case "Maternity":
        return "text-purple-600";
      case "Paternity":
        return "text-indigo-600";
      default:
        return "text-gray-600";
    }
  };

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
                              <SelectItem value="Vacation">Vacation</SelectItem>
                              <SelectItem value="Sick">Sick Leave</SelectItem>
                              <SelectItem value="Personal">Personal</SelectItem>
                              <SelectItem value="Maternity">
                                Maternity
                              </SelectItem>
                              <SelectItem value="Paternity">
                                Paternity
                              </SelectItem>
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
              <CardTitle>My Leave Requests</CardTitle>
              <CardDescription>
                Track the status of your submitted leave requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leave.length > 0 ? (
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">
                          Type
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Dates
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Days
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Status
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Submitted
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leave.map((request) => (
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
                            <Badge
                              variant={getStatusBadgeVariant(request.status)}
                            >
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
                            {request.status === "Pending" && (
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center space-y-6 py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No leave requests
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't submitted any leave requests yet.
                    </p>
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Request Leave
                    </Button>
                  </div>
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
