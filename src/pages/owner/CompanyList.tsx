import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Building2, Plus, Search, Settings2, Trash2, Users, ExternalLink } from "lucide-react";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Company {
  _id: string;
  name: string;
  domain?: string;
  createdAt?: string;
}

const ITEMS_PER_PAGE = 5;

export const CompanyList = () => {
  const { token } = useAppSelector((state) => state.auth);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCompanies = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await apiRequest<{ success: boolean; data: Company[] }>(
          "/api/owner/companies",
          { token }
        );
        if (response.success && Array.isArray(response.data)) {
          setCompanies(response.data);
        } else {
          toast({
            title: "Failed to load companies",
            description: "Unexpected response from server.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Failed to load companies",
          description: "An error occurred while fetching companies.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [token]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.domain && company.domain.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [companies, searchQuery]);

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const currentCompanies = filteredCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreateCompany = () => {
    navigate("/owner/companies/create");
  };

  const handleViewAdmins = (companyId: string) => {
    navigate(`/owner/companies/${companyId}/admins`);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage your registered enterprises and their details.
          </p>
        </div>
        <Button onClick={handleCreateCompany} className="w-full md:w-auto gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Create Company
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Enterprise Directory</CardTitle>
              <CardDescription>
                A list of all companies in your network.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
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
          ) : filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="p-4 rounded-full bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">No companies found</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {searchQuery 
                    ? `We couldn't find any companies matching "${searchQuery}"`
                    : "Get started by adding your first enterprise to the system."}
                </p>
              </div>
              {!searchQuery && (
                <Button variant="outline" onClick={handleCreateCompany} className="mt-4">
                  Add First Company
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border bg-background overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">Company</TableHead>
                      <TableHead className="font-semibold">Domain</TableHead>
                      <TableHead className="font-semibold">Registration Date</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCompanies.map((company) => (
                      <TableRow key={company._id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-primary/10">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{company.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {company.domain ? (
                            <code className="px-2 py-0.5 rounded bg-muted text-xs font-mono">
                              {company.domain}
                            </code>
                          ) : (
                            <span className="text-muted-foreground italic text-sm">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {company.createdAt
                            ? new Date(company.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewAdmins(company._id)}
                              title="Manage Admins"
                              className="h-8 w-8"
                            >
                              <Users className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Settings"
                              className="h-8 w-8"
                            >
                              <Settings2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredCompanies.length)}</span> of <span className="font-medium">{filteredCompanies.length}</span> results
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

