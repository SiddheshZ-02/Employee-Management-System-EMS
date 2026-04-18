import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Search, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getCompanies, deleteCompany } from "@/services/api/ownerApi";
import { toast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 5;

export const CompanyList = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, suspended: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, filter, search]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await getCompanies({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: filter !== "All" ? filter : undefined,
        search: search || undefined,
      });

      if (response.success) {
        setCompanies(response.data.companies);
        setTotalPages(response.data.pagination.totalPages);
        
        // Calculate stats
        const allCompanies = response.data.companies;
        setStats({
          total: response.data.pagination.totalItems,
          active: allCompanies.filter((c) => c.subscription?.status === "active").length,
          expired: allCompanies.filter((c) => c.subscription?.status === "expired").length,
          suspended: allCompanies.filter((c) => c.subscription?.status === "suspended").length,
        });
      }
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;

    try {
      const response = await deleteCompany(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Company deleted successfully",
        });
        fetchCompanies();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  const getBadgeStyle = (type: string) => {
    const map: any = {
      Active: "bg-green-500/10 text-green-500",
      Expired: "bg-red-500/10 text-red-500",
      Suspended: "bg-orange-500/10 text-orange-500",
      basic: "bg-blue-500/10 text-blue-500",
      pro: "bg-purple-500/10 text-purple-500",
      premium: "bg-indigo-500/10 text-indigo-500",
      enterprise: "bg-indigo-500/10 text-indigo-500",
    };
    return `text-[11px] font-bold px-2.5 py-0.5 rounded-full border-none ${map[type] || "bg-muted text-muted-foreground"}`;
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-8 p-6 bg-background min-h-full text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">Manage all your client companies and their subscriptions</p>
        </div>
        <Button 
          onClick={() => navigate("/owner/companies/create")}
          className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-lg text-sm border-none shadow-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total.toString(), color: "text-blue-500", icon: "🏢", bg: "bg-blue-500/10" },
          { label: "Active", value: stats.active.toString(), color: "text-green-500", icon: "🏢", bg: "bg-green-500/10" },
          { label: "Expired", value: stats.expired.toString(), color: "text-red-500", icon: "🏢", bg: "bg-red-500/10" },
          { label: "Suspended", value: stats.suspended.toString(), color: "text-orange-500", icon: "🏢", bg: "bg-orange-500/10" }
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-extrabold tracking-tighter">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
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
              placeholder="Search company..."
              className="bg-background border-border pl-9 h-10"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {["All", "Active", "Expired", "Suspended"].map(f => (
              <Button 
                key={f} 
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilter(f);
                  setCurrentPage(1);
                }}
                className="font-bold text-xs"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border overflow-hidden">
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
                    {["Company", "Plan", "Employees", "Status", "Joined", "Renewal", "Paid", "Actions"].map(h => (
                      <TableHead key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-3">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map(c => (
                    <TableRow key={c._id} className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                            {c.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold">{c.name}</div>
                            <div className="text-[11px] text-muted-foreground">{c.admin?.email || "N/A"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4"><Badge className={getBadgeStyle(c.subscription?.plan || "free")}>{c.subscription?.plan || "Free"}</Badge></TableCell>
                      <TableCell className="px-4 text-sm">{c.employeeCount || 0}</TableCell>
                      <TableCell className="px-4"><Badge className={getBadgeStyle(formatStatus(c.subscription?.status || "trial"))}>{formatStatus(c.subscription?.status || "trial")}</Badge></TableCell>
                      <TableCell className="px-4 text-sm text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                      <TableCell className="px-4 text-sm text-muted-foreground">{c.subscription?.renewalDate ? formatDate(c.subscription.renewalDate) : "—"}</TableCell>
                      <TableCell className="px-4 text-sm font-bold text-green-500">₹{(c.subscription?.amount || 0).toLocaleString()}</TableCell>
                      <TableCell className="px-4">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                            onClick={() => navigate(`/owner/companies/${c._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handleDelete(c._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, companies.length)} of {companies.length} entries
                </p>
                <Pagination className="justify-end w-auto mx-0">
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
          </>
        )}
      </Card>
    </div>
  );
};
