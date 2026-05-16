import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Mail, ShieldCheck, Briefcase, ArrowLeft, Search, Building2, MoreHorizontal, UserCog } from "lucide-react";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Company {
  _id: string;
  name: string;
  domain?: string;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  isActive?: boolean;
}

const ITEMS_PER_PAGE = 5;

const MOCK_ADMINS: Record<string, { company: Company; admins: AdminUser[] }> = {
  "1": {
    company: { _id: "1", name: "Acme International", domain: "acme-intl.com" },
    admins: [
      { _id: "a1", name: "John Doe", email: "john@acme.com", role: "admin", department: "IT", isActive: true },
      { _id: "a2", name: "Jane Smith", email: "jane@acme.com", role: "admin", department: "Operations", isActive: true },
    ]
  },
  "2": {
    company: { _id: "2", name: "Globex Corp", domain: "globex.io" },
    admins: [
      { _id: "a3", name: "Hank Scorpio", email: "hank@globex.io", role: "admin", department: "Management", isActive: true },
    ]
  }
};

export const CompanyAdmins = () => {
  useAppSelector((state) => state.auth);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (id && MOCK_ADMINS[id]) {
        setCompany(MOCK_ADMINS[id].company);
        setAdmins(MOCK_ADMINS[id].admins);
      } else {
        // Fallback for demo
        setCompany({ _id: id || "unknown", name: "Demo Company", domain: "demo.com" });
        setAdmins([
          { _id: "d1", name: "Demo Admin", email: "admin@demo.com", role: "admin", department: "General", isActive: true }
        ]);
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) =>
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (admin.department && admin.department.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [admins, searchQuery]);

  const totalPages = Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE);
  const currentAdmins = filteredAdmins.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/owner/companies")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {company ? company.name : "Company Admins"}
            </h1>
            <p className="text-muted-foreground">
              Manage administrative users for this enterprise.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/owner/companies")} className="gap-2">
            <Building2 className="h-4 w-4" />
            All Companies
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>
                Users with system-wide access to this company.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
                className="pl-9 bg-background/50"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : filteredAdmins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="p-4 rounded-full bg-muted">
                <UserCog className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">No administrators found</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {searchQuery 
                    ? `No admins found matching "${searchQuery}"`
                    : "This company doesn't have any administrators assigned yet."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md border bg-background overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">Administrator</TableHead>
                      <TableHead className="font-semibold">Role & Dept</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAdmins.map((admin) => (
                      <TableRow key={admin._id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{admin.name}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {admin.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="h-3 w-3 text-primary" />
                              <span className="text-sm capitalize font-medium">{admin.role || "admin"}</span>
                            </div>
                            {admin.department && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Briefcase className="h-3 w-3" />
                                {admin.department}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {admin.isActive !== false ? (
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                              <UserCheck className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200 gap-1">
                              <UserX className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                              <DropdownMenuItem className="text-rose-600">
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAdmins.length)}</span> of <span className="font-medium">{filteredAdmins.length}</span> results
                  </p>
                  <Pagination className="justify-end w-auto mx-0">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            href="#" 
                            isActive={currentPage === i + 1}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(i + 1);
                            }}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

