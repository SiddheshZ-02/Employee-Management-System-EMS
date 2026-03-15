import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { API_BASE_URL } from "@/constant/Config";

type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";
type LeaveFilter = "pending" | "approved" | "rejected" | "all";

interface AdminLeaveRequest {
  id: string;
  employeeName: string;
  employeeEmail: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  payType: "paid" | "unpaid";
  status: LeaveStatus;
  submittedAt?: string;
  approvedByName?: string;
  approvedByEmail?: string;
}

export const AdminLeaveRequests = () => {
  const { token } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  const [requests, setRequests] = useState<AdminLeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<LeaveFilter>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject">("approve");
  const [selectedRequest, setSelectedRequest] =
    useState<AdminLeaveRequest | null>(null);
  const [adminComment, setAdminComment] = useState("");

  const pageSize = 10;

  const fetchRequests = useCallback(
    async (page: number, status: LeaveFilter) => {
      if (!token) return;

      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (status !== "all") params.append("status", status);
        params.append("page", String(page));
        params.append("limit", String(pageSize));

        const res = await fetch(
          `${API_BASE_URL}/api/admin/leave-requests?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          toast({
            title: "Error",
            description: "Failed to fetch leave requests",
            variant: "destructive",
          });
          setRequests([]);
          setTotalPages(1);
          return;
        }

        const json: {
          success?: boolean;
          leaveRequests?: any[];
          pagination?: { totalPages?: number };
        } = await res.json();

        if (!json.success || !Array.isArray(json.leaveRequests)) {
          toast({
            title: "Error",
            description: "Unexpected response while fetching leave requests",
            variant: "destructive",
          });
          setRequests([]);
          setTotalPages(1);
          return;
        }

        const mapped: AdminLeaveRequest[] = json.leaveRequests
          .filter((r: any) => r.status !== "cancelled")
          .map((r: any) => ({
            id: String(r._id),
            employeeName: r.userId?.name || "Unknown",
            employeeEmail: r.userId?.email || "",
            employeeId: r.userId?.employeeId || "",
            type: r.leaveType || "other",
            startDate: format(new Date(r.startDate), "yyyy-MM-dd"),
            endDate: format(new Date(r.endDate), "yyyy-MM-dd"),
            days: r.totalDays || 0,
            reason: r.reason || "",
            payType: r.payType || "paid",
            status: r.status as LeaveStatus,
            submittedAt: r.createdAt,
            approvedByName: r.approvedBy?.name,
            approvedByEmail: r.approvedBy?.email,
          }));

        setRequests(mapped);
        setTotalPages(json.pagination?.totalPages || 1);
      } catch {
        toast({
          title: "Error",
          description: "Failed to fetch leave requests",
          variant: "destructive",
        });
        setRequests([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [token, toast]
  );

  useEffect(() => {
    fetchRequests(currentPage, statusFilter);
  }, [currentPage, statusFilter, fetchRequests]);

  const filteredRequests = requests.filter((req) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      req.employeeName.toLowerCase().includes(term) ||
      req.employeeEmail.toLowerCase().includes(term) ||
      req.employeeId.toLowerCase().includes(term)
    );
  });

  const openActionDialog = (
    request: AdminLeaveRequest,
    mode: "approve" | "reject"
  ) => {
    setSelectedRequest(request);
    setDialogMode(mode);
    setAdminComment("");
    setIsDialogOpen(true);
  };

  const handleAction = async () => {
    if (!token || !selectedRequest) return;

    const status: LeaveStatus =
      dialogMode === "approve" ? "approved" : "rejected";

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/leave/request/${selectedRequest.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            rejectionReason: adminComment,
          }),
        }
      );

      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to update leave request",
          variant: "destructive",
        });
        return;
      }

      toast({
        title:
          dialogMode === "approve"
            ? "Leave request approved"
            : "Leave request rejected",
      });

      setIsDialogOpen(false);
      fetchRequests(currentPage, statusFilter);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update leave request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: LeaveStatus) => {
    if (status === "approved") return "default";
    if (status === "rejected" || status === "cancelled") return "destructive";
    if (status === "pending") return "secondary";
    return "outline";
  };

  const getStatusLabel = (status: LeaveStatus) => {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    if (status === "cancelled") return "Cancelled";
    if (status === "pending") return "Pending";
    return status;
  };

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold truncate">
                Leave Requests
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Review and process employee leave requests.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl">
                    All Leave Requests
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Filter and manage employee leave requests.
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, or ID"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(value: LeaveFilter) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Loading leave requests...
                </div>
              ) : filteredRequests.length > 0 ? (
                <>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[80px] font-semibold text-foreground text-center">
                            Sr No
                          </TableHead>
                          <TableHead className="font-semibold text-foreground text-center">
                            Employee
                          </TableHead>
                          <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">
                            Type
                          </TableHead>
                          <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">
                            Pay Type
                          </TableHead>
                          <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">
                            Dates
                          </TableHead>
                          <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">
                            Days
                          </TableHead>
                          <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold text-foreground text-center whitespace-nowrap hidden lg:table-cell">
                            Submitted
                          </TableHead>
                          <TableHead className="font-semibold text-foreground text-center whitespace-nowrap hidden lg:table-cell">
                            Processed By
                          </TableHead>
                          <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request, index) => (
                          <TableRow
                            key={request.id}
                            className="hover:bg-muted/30 transition-colors border-b last:border-0"
                          >
                            <TableCell className="text-center font-medium">
                              {(currentPage - 1) * pageSize + index + 1}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium truncate">
                                  {request.employeeName}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {request.employeeEmail}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm">
                                {request.type.charAt(0).toUpperCase() +
                                  request.type.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="capitalize bg-muted/30"
                              >
                                {request.payType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="text-sm">
                                <div className="truncate">
                                  {request.startDate} -
                                </div>
                                <div className="text-muted-foreground truncate">
                                  {request.endDate}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-foreground text-xs font-semibold">
                                {request.days}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={getStatusBadgeVariant(request.status)}
                                className={
                                  request.status === "approved"
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : request.status === "rejected"
                                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                }
                              >
                                {getStatusLabel(request.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center hidden lg:table-cell">
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
                            <TableCell className="text-center hidden lg:table-cell">
                              {request.approvedByName ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-sm">
                                    {request.approvedByName}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {request.approvedByEmail}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  -
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                {request.status === "pending" ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() =>
                                        openActionDialog(request, "approve")
                                      }
                                      title="Approve"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                      onClick={() =>
                                        openActionDialog(request, "reject")
                                      }
                                      title="Reject"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : request.status === "approved" ? (
                                  <div
                                    className="flex items-center justify-center h-8 w-8 rounded-full bg-green-50 text-green-600"
                                    title="Approved"
                                  >
                                    <Check className="h-4 w-4" />
                                  </div>
                                ) : (
                                  <div
                                    className="flex items-center justify-center h-8 w-8 rounded-full bg-red-50 text-red-600"
                                    title="Rejected"
                                  >
                                    <X className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Attendance tracking style pagination */}
                  <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-card mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing{" "}
                      <span className="font-semibold text-foreground">
                        {(currentPage - 1) * pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-foreground">
                        {Math.min(currentPage * pageSize, filteredRequests.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-foreground">
                        {filteredRequests.length}
                      </span>{" "}
                      records
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
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 px-2"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No leave requests found for the current filters.
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>
                  {dialogMode === "approve" ? "Approve Leave" : "Reject Leave"}
                </DialogTitle>
                <DialogDescription>
                  {dialogMode === "approve"
                    ? "Confirm approval of this leave request and optionally add a comment."
                    : "Confirm rejection of this leave request and optionally add a comment."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedRequest && (
                  <div className="text-sm space-y-1">
                    <div className="font-medium">
                      {selectedRequest.employeeName} (
                      {selectedRequest.employeeId})
                    </div>
                    <div className="text-muted-foreground">
                      {selectedRequest.startDate} – {selectedRequest.endDate} (
                      {selectedRequest.days} days,{" "}
                      {selectedRequest.type.charAt(0).toUpperCase() +
                        selectedRequest.type.slice(1)},{" "}
                      {selectedRequest.payType.charAt(0).toUpperCase() +
                        selectedRequest.payType.slice(1)}
                      )
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reason: {selectedRequest.reason || "N/A"}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add an optional comment for the employee..."
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAction}>
                  {dialogMode === "approve" ? "Approve" : "Reject"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
