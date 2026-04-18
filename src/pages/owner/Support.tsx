import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { Eye, CheckCircle } from "lucide-react";
import {
  getSupportTickets,
  updateSupportTicket,
  getSupportAnalytics,
  type SupportTicket,
} from "@/services/api/ownerApi";

const ITEMS_PER_PAGE = 10;

export const SupportPage = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [analytics, setAnalytics] = useState({
    openTickets: 0,
    resolvedToday: 0,
    avgResponseTime: "0 hrs",
  });

  useEffect(() => {
    fetchTickets();
    fetchAnalytics();
  }, [filter, currentPage]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getSupportTickets({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: filter !== "All" ? filter : undefined,
      });

      if (response.success) {
        setTickets(response.data.tickets);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await getSupportAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;

    try {
      const response = await updateSupportTicket(selectedTicket._id, {
        status: "resolved",
        resolutionNotes,
      });

      if (response.success) {
        toast.success("Ticket resolved successfully");
        setIsResolveDialogOpen(false);
        setIsDetailDialogOpen(false);
        setResolutionNotes("");
        setCurrentPage(1);
        fetchTickets();
        fetchAnalytics();
        
        window.dispatchEvent(new CustomEvent('ticketResolved'));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resolve ticket");
    }
  };

  const getBadgeStyle = (type: string) => {
    const map: any = {
      open: "bg-blue-500/10 text-blue-500",
      "in-progress": "bg-purple-500/10 text-purple-500",
      resolved: "bg-green-500/10 text-green-500",
      closed: "bg-gray-500/10 text-gray-500",
      high: "bg-red-500/10 text-red-500",
      medium: "bg-orange-500/10 text-orange-500",
      low: "bg-green-500/10 text-green-500",
      critical: "bg-red-600/10 text-red-600",
    };
    return `text-[11px] font-bold px-2.5 py-0.5 rounded-full border-none ${map[type] || ""}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8 p-6 bg-background min-h-full text-foreground">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">Resolve issues raised by your client companies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border relative overflow-hidden pt-1">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500" />
          <CardContent className="p-5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Open Tickets</div>
            <div className="text-3xl font-extrabold tracking-tighter">{analytics.openTickets}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border relative overflow-hidden pt-1">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-green-500" />
          <CardContent className="p-5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Resolved Today</div>
            <div className="text-3xl font-extrabold tracking-tighter">{analytics.resolvedToday}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border relative overflow-hidden pt-1">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
          <CardContent className="p-5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Avg Response</div>
            <div className="text-3xl font-extrabold tracking-tighter">{analytics.avgResponseTime}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <CardTitle className="text-sm font-bold">All Tickets</CardTitle>
          <div className="flex gap-2">
            {["All", "Open", "In-progress", "Resolved", "Closed"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className="font-bold text-xs"
              >
                {f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                {["Ticket ID", "Company", "Subject", "Priority", "Status", "Time", "Action"].map((h) => (
                  <TableHead key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-6 py-3 border-none">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading tickets...
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow key={t._id} className="border-b border-border/50 hover:bg-muted/50 transition-colors border-none">
                    <TableCell className="px-6 py-4 font-mono text-primary text-xs border-none">{t.ticketNumber}</TableCell>
                    <TableCell className="px-6 text-sm border-none">{t.companyId?.name || "N/A"}</TableCell>
                    <TableCell className="px-6 text-sm border-none max-w-[300px] truncate">{t.subject}</TableCell>
                    <TableCell className="px-6 border-none"><Badge className={getBadgeStyle(t.priority)}>{t.priority}</Badge></TableCell>
                    <TableCell className="px-6 border-none"><Badge className={getBadgeStyle(t.status)}>{t.status}</Badge></TableCell>
                    <TableCell className="px-6 text-xs text-muted-foreground border-none">{formatDate(t.createdAt)}</TableCell>
                    <TableCell className="px-6 border-none">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 h-auto hover:bg-primary/20 gap-1"
                          onClick={() => {
                            setSelectedTicket(t);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        {t.status !== "resolved" && t.status !== "closed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2.5 py-1 h-auto hover:bg-green-500/20 gap-1"
                            onClick={() => {
                              setSelectedTicket(t);
                              setIsResolveDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-card border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} tickets
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              Ticket #{selectedTicket?.ticketNumber} • {selectedTicket?.companyId?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priority</p>
                <Badge className={getBadgeStyle(selectedTicket?.priority || "")}>
                  {selectedTicket?.priority}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={getBadgeStyle(selectedTicket?.status || "")}>
                  {selectedTicket?.status}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
              <p className="text-sm">{selectedTicket?.description}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Raised By</p>
              <p className="text-sm">{selectedTicket?.raisedBy?.name} ({selectedTicket?.raisedBy?.email})</p>
            </div>

            {selectedTicket?.resolutionNotes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Resolution Notes</p>
                <p className="text-sm bg-muted p-3 rounded">{selectedTicket.resolutionNotes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {selectedTicket?.status !== "resolved" && selectedTicket?.status !== "closed" && (
                <Button
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsResolveDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Resolve Ticket
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolve Ticket Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber} - {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution Notes</label>
              <Textarea
                placeholder="Describe how this issue was resolved..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleResolveTicket} className="flex-1 gap-2">
                <CheckCircle className="h-4 w-4" />
                Mark as Resolved
              </Button>
              <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
