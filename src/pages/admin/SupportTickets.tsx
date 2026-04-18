import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, MessageSquare, Clock, AlertCircle, Eye, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  createSupportTicket,
  getSupportTickets,
  getTicketById,
  addTicketResponse,
  type SupportTicket as TicketType,
} from "@/services/api/adminApi";

export const AdminSupportTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  // Create ticket form
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [category, setCategory] = useState<"billing" | "technical" | "account" | "feature-request" | "other">("other");

  // Ticket detail and reply
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getSupportTickets({
        page: 1,
        limit: 50,
        status: filter !== "All" ? filter : undefined,
      });

      if (response.success) {
        setTickets(response.data.tickets);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      toast.error("Subject and description are required");
      return;
    }

    try {
      const response = await createSupportTicket({
        subject,
        description,
        priority,
        category,
      });

      if (response.success) {
        toast.success(`Ticket ${response.data.ticketNumber} created successfully`);
        setIsCreateDialogOpen(false);
        setSubject("");
        setDescription("");
        setPriority("medium");
        setCategory("other");
        fetchTickets();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create ticket");
    }
  };

  const handleViewTicket = async (ticketId: string) => {
    try {
      const response = await getTicketById(ticketId);
      if (response.success) {
        setSelectedTicket(response.data);
        setReplyMessage("");
        setIsDetailDialogOpen(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch ticket details");
    }
  };

  const handleAddReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setIsSubmittingReply(true);
      const response = await addTicketResponse(selectedTicket._id, {
        message: replyMessage,
      });

      if (response.success) {
        toast.success("Reply added successfully");
        setSelectedTicket(response.data);
        setReplyMessage("");
        fetchTickets();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-500/10 text-red-500",
      high: "bg-orange-500/10 text-orange-500",
      medium: "bg-yellow-500/10 text-yellow-500",
      low: "bg-green-500/10 text-green-500",
    };
    return colors[priority] || "bg-gray-500/10 text-gray-500";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-500/10 text-blue-500",
      "in-progress": "bg-purple-500/10 text-purple-500",
      resolved: "bg-green-500/10 text-green-500",
      closed: "bg-gray-500/10 text-gray-500",
    };
    return colors[status] || "bg-gray-500/10 text-gray-500";
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="h-10 w-10 border shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Raise and track issues with the platform
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Raise Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Raise Support Ticket</DialogTitle>
              <DialogDescription>Describe your issue or request</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Brief description of the issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Detailed description of the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={priority}
                    onValueChange={(value: any) => setPriority(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={category}
                    onValueChange={(value: any) => setCategory(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="feature-request">Feature Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleCreateTicket} className="w-full">
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.open}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Your Tickets</CardTitle>
          <div className="flex gap-2">
            {["All", "Open", "In-progress", "Resolved", "Closed"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className="text-xs"
              >
                {f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No tickets found</p>
              <Button
                variant="link"
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-2"
              >
                Raise your first ticket
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell className="font-mono text-xs">
                      {ticket.ticketNumber}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {ticket.subject}
                    </TableCell>
                    <TableCell className="capitalize">{ticket.category}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleViewTicket(ticket._id)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog with Reply Feature */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              Ticket #{selectedTicket?.ticketNumber} • Created {selectedTicket && formatDateTime(selectedTicket.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Priority</p>
                <Badge className={getPriorityColor(selectedTicket?.priority || "")}>
                  {selectedTicket?.priority}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                <Badge className={getStatusColor(selectedTicket?.status || "")}>
                  {selectedTicket?.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                <p className="text-sm capitalize">{selectedTicket?.category}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
              <p className="text-sm bg-muted p-3 rounded-md">{selectedTicket?.description}</p>
            </div>

            {/* Responses/Replies */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Conversation ({selectedTicket?.responses.length || 0})
              </p>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {selectedTicket?.responses && selectedTicket.responses.length > 0 ? (
                  selectedTicket.responses.map((response, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md ${
                        response.from.role === 'Admin'
                          ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium">{response.from.name}</p>
                          <p className="text-xs text-muted-foreground">{response.from.email}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(response.timestamp)}
                        </p>
                      </div>
                      <p className="text-sm">{response.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No replies yet
                  </p>
                )}
              </div>
            </div>

            {/* Reply Input */}
            {selectedTicket?.status !== "resolved" && selectedTicket?.status !== "closed" && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Add a Reply</p>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddReply}
                    disabled={isSubmittingReply || !replyMessage.trim()}
                    className="self-end gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmittingReply ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            )}

            {/* Resolution Notes */}
            {selectedTicket?.resolutionNotes && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-md">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                  Resolution Notes
                </p>
                <p className="text-sm">{selectedTicket.resolutionNotes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};