import { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, FileSpreadsheet, Search, Filter } from "lucide-react";
import * as XLSX from "xlsx";
import {
  getInvoices,
  getRevenueAnalytics,
  retryPayment,
  downloadInvoicePDF,
  type Invoice,
  type Pagination,
} from "@/services/api/ownerApi";
import { toast } from "@/hooks/use-toast";
import {
  Pagination as PaginationUI,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

export const BillingPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: ITEMS_PER_PAGE,
  });
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [analytics, setAnalytics] = useState<{
    mrr: number;
    arr: number;
    pendingAmount: number;
    churnRate: number;
    revenueData: Array<{ month: string; revenue: number; new: number }>;
  } | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    fetchInvoices();
  }, [pagination.currentPage, statusFilter, searchQuery]);

  const fetchAnalytics = async () => {
    try {
      const response = await getRevenueAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load revenue analytics",
        variant: "destructive",
      });
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await getInvoices({
        page: pagination.currentPage,
        limit: ITEMS_PER_PAGE,
        status: statusFilter !== "All" ? statusFilter : undefined,
      });

      if (response.success) {
        setInvoices(response.data.invoices);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async (invoiceId: string) => {
    try {
      setRetryingId(invoiceId);
      const response = await retryPayment(invoiceId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Payment processed successfully",
        });
        fetchInvoices();
        fetchAnalytics();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setRetryingId(null);
    }
  };

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      await downloadInvoicePDF(invoice._id);
      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error: any) {
      console.error("Error downloading invoice:", error);
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = async () => {
    try {
      toast({
        title: "Info",
        description: "Preparing Excel export...",
      });

      // Fetch all invoices for export
      const allInvoices: Invoice[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getInvoices({
          page,
          limit: 100,
          status: statusFilter !== "All" ? statusFilter : undefined,
        });

        if (response.success && response.data.invoices.length > 0) {
          allInvoices.push(...response.data.invoices);
          page++;
          hasMore = page <= response.data.pagination.totalPages;
        } else {
          hasMore = false;
        }
      }

      // Prepare data for Excel
      const excelData = allInvoices.map((inv) => ({
        "Invoice ID": inv.invoiceNumber,
        "Company": inv.companyId?.name || "N/A",
        "Plan": inv.plan?.toUpperCase() || "N/A",
        "Amount (₹)": inv.amount,
        "Status": inv.status.toUpperCase(),
        "Date": new Date(inv.createdAt).toLocaleDateString(),
        "Currency": "INR",
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      ws["!cols"] = [
        { wch: 20 }, // Invoice ID
        { wch: 30 }, // Company
        { wch: 15 }, // Plan
        { wch: 15 }, // Amount
        { wch: 12 }, // Status
        { wch: 15 }, // Date
        { wch: 10 }, // Currency
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Invoices");

      // Generate filename with date
      const filename = `Invoices_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
      
      // Download file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Success",
        description: `Exported ${allInvoices.length} invoices to Excel`,
      });
    } catch (error: any) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Error",
        description: "Failed to export invoices",
        variant: "destructive",
      });
    }
  };

  const getBadgeStyle = (type: string) => {
    const map: Record<string, string> = {
      paid: "bg-green-500/10 text-green-500",
      overdue: "bg-red-500/10 text-red-500",
      failed: "bg-rose-500/10 text-rose-500",
      pending: "bg-yellow-500/10 text-yellow-500",
      basic: "bg-blue-500/10 text-blue-500",
      pro: "bg-purple-500/10 text-purple-500",
      premium: "bg-indigo-500/10 text-indigo-500",
      enterprise: "bg-indigo-500/10 text-indigo-500",
    };
    return `text-[11px] font-bold px-2.5 py-0.5 rounded-full border-none ${map[type.toLowerCase()] || "bg-muted text-muted-foreground"}`;
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-8 p-6 bg-background min-h-full text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Billing & Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Track all invoices, payments, and subscription renewals</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="bg-muted border-none text-muted-foreground font-bold text-xs px-4 py-2 h-auto hover:bg-muted/80 flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "MRR", value: analytics ? `₹${analytics.mrr.toLocaleString()}` : "—", color: "#38bdf8", icon: "💰" },
          { label: "ARR", value: analytics ? `₹${analytics.arr.toLocaleString()}` : "—", color: "#4ade80", icon: "📈" },
          { label: "Pending", value: analytics ? `₹${analytics.pendingAmount.toLocaleString()}` : "—", color: "#fb923c", icon: "⏳" },
          { label: "Churn Rate", value: analytics ? `${analytics.churnRate}%` : "—", color: "#f87171", icon: "📉" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border relative overflow-hidden pt-1">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: stat.color }} />
            <CardContent className="p-5">
              <div className="flex justify-between mb-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className="text-2xl font-extrabold tracking-tighter">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-card border-border p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice ID or company..."
              className="bg-background border-border pl-9 h-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {["All", "Paid", "Pending", "Overdue", "Failed"].map((f) => (
              <Button
                key={f}
                variant={statusFilter === f ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter(f);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="font-bold text-xs flex items-center gap-2"
              >
                <Filter className="h-3 w-3" />
                {f}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Revenue Bar Chart */}
      {analytics?.revenueData && (
        <Card className="bg-card border-border p-6">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="text-sm font-bold">Monthly Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.revenueData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} />
                <YAxis className="text-muted-foreground" tick={{ fontSize: 11, fill: "currentColor" }} tickFormatter={(v) => `₹${v / 1000}k`} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 10, color: "hsl(var(--card-foreground))", fontSize: 12 }}
                  cursor={{ fill: "currentColor", opacity: 0.05 }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, ""]}
                />
                <Bar dataKey="revenue" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Total Revenue" />
                <Bar dataKey="new" fill="#818cf8" radius={[6, 6, 0, 0]} name="New Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <CardTitle className="text-sm font-bold">All Invoices</CardTitle>
        </CardHeader>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    {["Invoice ID", "Company", "Plan", "Amount", "Status", "Date", "Action"].map((h) => (
                      <TableHead key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-6 py-3 border-none">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv) => (
                      <TableRow key={inv._id} className="border-b border-border/50 hover:bg-muted/50 transition-colors border-none">
                        <TableCell className="px-6 py-4 font-mono text-primary text-xs border-none">{inv.invoiceNumber}</TableCell>
                        <TableCell className="px-6 text-sm border-none">{inv.companyId?.name || "N/A"}</TableCell>
                        <TableCell className="px-6 border-none">
                          <Badge className={getBadgeStyle(inv.plan)}>{formatStatus(inv.plan)}</Badge>
                        </TableCell>
                        <TableCell className="px-6 text-sm font-bold border-none">₹{inv.amount.toLocaleString()}</TableCell>
                        <TableCell className="px-6 border-none">
                          <Badge className={getBadgeStyle(inv.status)}>{formatStatus(inv.status)}</Badge>
                        </TableCell>
                        <TableCell className="px-6 text-xs text-muted-foreground border-none">
                          {new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell className="px-6 border-none">
                          <div className="flex gap-2">
                            <button
                              onClick={() => downloadInvoice(inv)}
                              className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-md hover:bg-primary/20 flex items-center gap-1 transition-colors"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </button>
                            {(inv.status === "failed" || inv.status === "overdue") && (
                              <button
                                onClick={() => handleRetryPayment(inv._id)}
                                disabled={retryingId === inv._id}
                                className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2.5 py-1 rounded-md hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                              >
                                {retryingId === inv._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Retry"
                                )}
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing {(pagination.currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(pagination.currentPage * ITEMS_PER_PAGE, pagination.totalItems)} of {pagination.totalItems} entries
                </p>
                <PaginationUI className="justify-end w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))
                        }
                        className={pagination.currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={pagination.currentPage === i + 1}
                          onClick={() => setPagination((prev) => ({ ...prev, currentPage: i + 1 }))}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: Math.min(pagination.totalPages, prev.currentPage + 1),
                          }))
                        }
                        className={pagination.currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </PaginationUI>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};
