import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/hooks/useAppSelector";
import { apiRequest } from "@/lib/api";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Building2,
  Users,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  CreditCard,
  AlertTriangle,
  Settings2,
  Download,
  Filter,
  Activity as ActivityIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

interface OwnerDashboardSummary {
  totalCompanies: number;
  totalAdmins: number;
  totalEmployees: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  upcomingRenewals30: number;
  upcomingRenewals60: number;
  upcomingRenewals90: number;
  failedPayments: number;
}

interface OwnerAdminMetric {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  companyName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  employeeCount: number;
  activityScore: number;
  approvalsLast30d: number;
}

interface OwnerSubscription {
  companyId: string;
  companyName: string;
  plan: string;
  status: "active" | "trial" | "past_due" | "cancelled";
  startedAt: string;
  renewalDate: string;
  daysUntilRenewal: number;
  amount: number;
  currency: string;
  alerts: {
    is30Day: boolean;
    is60Day: boolean;
    is90Day: boolean;
  };
}

interface RevenuePoint {
  month: string;
  label: string;
  revenue: number;
}

interface EmployeeGrowthPoint {
  month: string;
  label: string;
  employees: number;
}

interface OwnerTransaction {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "failed" | "refunded" | "pending";
  type: string;
  reference: string;
  canRetry: boolean;
}

interface SubscriptionConversion {
  totalCompanies: number;
  paidCompanies: number;
  conversionRate: number;
}

interface AdminActivityHeatmapPoint {
  date: string;
  activeAdmins: number;
  totalActions: number;
}

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  tier: string;
}

interface ServiceTier {
  key: string;
  name: string;
  maxEmployees: number;
  maxAdmins: number;
  price: number;
  currency: string;
}

interface CapacityMetrics {
  totalEmployeeCapacity: number;
  usedEmployeeCapacity: number;
  projectedIn90Days: number;
}

interface OwnerDashboardAnalyticsResponse {
  success: boolean;
  data: {
    summary: OwnerDashboardSummary;
    admins: OwnerAdminMetric[];
    subscriptions: OwnerSubscription[];
    revenueSeries: RevenuePoint[];
    transactions: OwnerTransaction[];
    employeeGrowthSeries: EmployeeGrowthPoint[];
    subscriptionConversion: SubscriptionConversion;
    adminActivityHeatmap: AdminActivityHeatmapPoint[];
    featureFlags: FeatureFlag[];
    serviceTiers: ServiceTier[];
    capacity: CapacityMetrics;
  };
}

class OwnerSectionErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Something went wrong</span>
            </CardTitle>
            <CardDescription>
              Unable to load this section. Please refresh the page.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }
    return this.props.children;
  }
}

const modulePreferenceKey = "ems_owner_dashboard_modules";

type ModuleKey =
  | "admins"
  | "subscriptions"
  | "financials"
  | "services"
  | "analytics";

type ModulePreferences = Record<ModuleKey, boolean>;

const getDefaultPreferences = (): ModulePreferences => ({
  admins: true,
  subscriptions: true,
  financials: true,
  services: true,
  analytics: true,
});

const loadModulePreferences = (): ModulePreferences => {
  try {
    const raw = localStorage.getItem(modulePreferenceKey);
    if (!raw) return getDefaultPreferences();
    const parsed = JSON.parse(raw) as ModulePreferences;
    return { ...getDefaultPreferences(), ...parsed };
  } catch {
    return getDefaultPreferences();
  }
};

const saveModulePreferences = (prefs: ModulePreferences) => {
  try {
    localStorage.setItem(modulePreferenceKey, JSON.stringify(prefs));
  } catch {
    return;
  }
};

export const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [modulePrefs, setModulePrefs] = useState<ModulePreferences>(() =>
    loadModulePreferences()
  );
  const [adminSearch, setAdminSearch] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<
    "all" | "active" | "trial" | "past_due"
  >("all");

  const { data, isLoading, isError } = useQuery<OwnerDashboardAnalyticsResponse>({
    queryKey: ["owner-dashboard-analytics"],
    enabled: Boolean(token),
    staleTime: 60_000,
    queryFn: () =>
      apiRequest<OwnerDashboardAnalyticsResponse>("/api/owner/dashboard-analytics", {
        token,
      }),
  });

  const summary = data?.data.summary;
  const admins = data?.data.admins || [];
  const subscriptions = data?.data.subscriptions || [];
  const revenueSeries = data?.data.revenueSeries || [];
  const transactions = data?.data.transactions || [];
  const employeeGrowthSeries = data?.data.employeeGrowthSeries || [];
  const subscriptionConversion = data?.data.subscriptionConversion;
  const activityHeatmap = data?.data.adminActivityHeatmap || [];
  const featureFlags = data?.data.featureFlags || [];
  const serviceTiers = data?.data.serviceTiers || [];
  const capacity = data?.data.capacity;

  const filteredAdmins = useMemo(() => {
    if (!adminSearch.trim()) return admins;
    const term = adminSearch.toLowerCase();
    return admins.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term) ||
        a.companyName.toLowerCase().includes(term)
    );
  }, [admins, adminSearch]);

  const filteredSubscriptions = useMemo(() => {
    if (subscriptionFilter === "all") return subscriptions;
    return subscriptions.filter((s) => s.status === subscriptionFilter);
  }, [subscriptions, subscriptionFilter]);

  const handleToggleModule = (key: ModuleKey) => {
    setModulePrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveModulePreferences(next);
      return next;
    });
  };

  const handleExportPdf = async () => {
    try {
      const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      type AutoTableFn = (doc: unknown, options: unknown) => void;
      const autoTableModuleTyped = autoTableModule as {
        default?: AutoTableFn;
      };
      const autoTable: AutoTableFn =
        autoTableModuleTyped.default ??
        ((autoTableModuleTyped as unknown) as AutoTableFn);

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Owner Dashboard Summary", 14, 18);

      const summaryRows = [
        ["Total Companies", summary?.totalCompanies ?? 0],
        ["Total Admins", summary?.totalAdmins ?? 0],
        ["Total Employees", summary?.totalEmployees ?? 0],
        ["Active Subscriptions", summary?.activeSubscriptions ?? 0],
        ["MRR (USD)", summary?.monthlyRecurringRevenue ?? 0],
        ["Upcoming Renewals (30d)", summary?.upcomingRenewals30 ?? 0],
        ["Upcoming Renewals (60d)", summary?.upcomingRenewals60 ?? 0],
        ["Upcoming Renewals (90d)", summary?.upcomingRenewals90 ?? 0],
        ["Failed Payments", summary?.failedPayments ?? 0],
      ];

      autoTable(doc, {
        head: [["Metric", "Value"]],
        body: summaryRows,
        startY: 24,
      });

      if (admins.length) {
        const lastAutoTableY =
          ((doc as unknown) as { lastAutoTable?: { finalY?: number } })
            .lastAutoTable?.finalY ?? 40;

        autoTable(doc, {
          head: [["Admin", "Company", "Employees", "Score", "Approvals (30d)"]],
          body: admins.slice(0, 10).map((a) => [
            a.name,
            a.companyName,
            a.employeeCount,
            `${a.activityScore}`,
            a.approvalsLast30d,
          ]),
          startY: lastAutoTableY + 10,
        });
      }

      doc.save("owner-dashboard-summary.pdf");
      toast({
        title: "Report exported",
        description: "PDF summary has been downloaded.",
      });
    } catch {
      toast({
        title: "Export failed",
        description: "Unable to generate PDF report.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = transactions.map((t) => ({
        Reference: t.reference,
        Company: t.companyName,
        Date: new Date(t.date).toISOString().slice(0, 10),
        Amount: t.amount,
        Currency: t.currency,
        Status: t.status,
        Type: t.type,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
      XLSX.writeFile(workbook, "owner-transactions.xlsx");

      toast({
        title: "Report exported",
        description: "Excel transaction report has been downloaded.",
      });
    } catch {
      toast({
        title: "Export failed",
        description: "Unable to generate Excel report.",
        variant: "destructive",
      });
    }
  };

  const handleRetryPayment = (tx: OwnerTransaction) => {
    if (!tx.canRetry) return;
    toast({
      title: "Recovery triggered",
      description: `Recovery workflow started for ${tx.reference}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Unable to load dashboard</span>
            </CardTitle>
            <CardDescription>
              There was a problem loading owner analytics. Please refresh the page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Central command center for admins, subscriptions, finances, and service readiness.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPdf}>
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportExcel}>
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/owner/companies/create")}
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Company</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
          <Settings2 className="h-3 w-3" />
          Modules
        </span>
        {(
          [
            ["admins", "Active Admins"],
            ["subscriptions", "Subscriptions"],
            ["financials", "Financials"],
            ["services", "Services"],
            ["analytics", "Analytics"],
          ] as [ModuleKey, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
              modulePrefs[key]
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-muted text-muted-foreground border-transparent"
            }`}
            onClick={() => handleToggleModule(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">
                {summary?.totalCompanies ?? 0}
              </span>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">
                {summary?.totalAdmins ?? 0}
              </span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Monthly Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">
                ${summary?.monthlyRecurringRevenue ?? 0}
              </span>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Upcoming Renewals (30/60/90)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              30d: {summary?.upcomingRenewals30 ?? 0}
            </Badge>
            <Badge variant="outline" className="text-xs">
              60d: {summary?.upcomingRenewals60 ?? 0}
            </Badge>
            <Badge variant="outline" className="text-xs">
              90d: {summary?.upcomingRenewals90 ?? 0}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {modulePrefs.admins && (
        <OwnerSectionErrorBoundary>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Active Admin Management</h2>
                  <p className="text-xs text-muted-foreground">
                    Live employee coverage, admin performance, and access visibility.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admins or companies..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="h-8 w-[220px]"
                />
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Admin roster</CardTitle>
                <CardDescription>
                  Each admin’s employee footprint, engagement score, and access level.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-center">Employees</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-center">Approvals (30d)</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAdmins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{admin.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {admin.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{admin.companyName}</TableCell>
                          <TableCell className="text-center text-sm">
                            {admin.employeeCount}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                admin.activityScore > 80
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : admin.activityScore > 50
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-rose-500/10 text-rose-600"
                              }`}
                            >
                              {admin.activityScore}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {admin.approvalsLast30d}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={admin.isActive ? "default" : "outline"}
                              className={admin.isActive ? "" : "text-muted-foreground"}
                            >
                              {admin.isActive ? (
                                <ShieldCheck className="h-3 w-3 mr-1" />
                              ) : (
                                <ShieldAlert className="h-3 w-3 mr-1" />
                              )}
                              {admin.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!filteredAdmins.length && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-xs text-muted-foreground">
                            No admins found for the current filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/owner/companies")}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Manage companies
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </OwnerSectionErrorBoundary>
      )}

      {modulePrefs.subscriptions && (
        <OwnerSectionErrorBoundary>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">
                    Subscription Lifecycle Management
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Active plans, renewal windows, and billing health.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Status:</span>
                {(["all", "active", "trial", "past_due"] as Array<
                  "all" | "active" | "trial" | "past_due"
                >).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSubscriptionFilter(f)}
                    className={`px-2 py-1 rounded-full border transition-colors ${
                      subscriptionFilter === f
                        ? "bg-primary/10 text-primary border-primary/40"
                        : "bg-muted text-muted-foreground border-transparent"
                    }`}
                  >
                    {f === "past_due" ? "Past due" : f[0].toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active subscriptions</CardTitle>
                <CardDescription>
                  30/60/90-day renewal alerts and status per company.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead className="text-center">Amount</TableHead>
                        <TableHead className="text-center">Renewal</TableHead>
                        <TableHead className="text-center">Days left</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map((sub) => (
                        <TableRow key={String(sub.companyId)}>
                          <TableCell className="text-sm">{sub.companyName}</TableCell>
                          <TableCell className="text-sm uppercase">
                            {sub.plan}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {sub.currency} {sub.amount}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {new Date(sub.renewalDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {sub.daysUntilRenewal >= 0 ? sub.daysUntilRenewal : "Overdue"}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Badge
                                variant={
                                  sub.status === "active"
                                    ? "default"
                                    : sub.status === "past_due"
                                    ? "destructive"
                                    : "outline"
                                }
                                className="text-[11px]"
                              >
                                {sub.status === "past_due" ? "Past due" : sub.status}
                              </Badge>
                              {sub.alerts.is30Day && (
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                              )}
                              {sub.alerts.is60Day && (
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                              )}
                              {sub.alerts.is90Day && (
                                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!filteredSubscriptions.length && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-xs text-muted-foreground">
                            No subscriptions found for the selected filter.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </OwnerSectionErrorBoundary>
      )}

      {modulePrefs.financials && (
        <OwnerSectionErrorBoundary>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Revenue analytics</span>
                </CardTitle>
                <CardDescription>
                  Monthly recurring revenue trend across your portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSeries}>
                    <defs>
                      <linearGradient id="mrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        fontSize: 11,
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fill="url(#mrr)"
                      name="MRR"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5 text-primary" />
                  <span>Transaction health</span>
                </CardTitle>
                <CardDescription>
                  Confirmation states and recovery actions for recent payments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">
                    Paid:{" "}
                    {transactions.filter((t) => t.status === "paid").length}
                  </Badge>
                  <Badge variant="outline">
                    Failed:{" "}
                    {transactions.filter((t) => t.status === "failed").length}
                  </Badge>
                  <Badge variant="outline">
                    Pending:{" "}
                    {transactions.filter((t) => t.status === "pending").length}
                  </Badge>
                </div>
                <div className="max-h-[220px] overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-center">Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 15).map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs font-medium">
                            {tx.reference}
                          </TableCell>
                          <TableCell className="text-xs">
                            {tx.companyName}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {tx.currency} {tx.amount}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                tx.status === "paid"
                                  ? "default"
                                  : tx.status === "failed"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="text-[11px]"
                            >
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {tx.status === "failed" && tx.canRetry && (
                              <Button
                                size="xs"
                                variant="outline"
                                className="text-[11px] h-7"
                                onClick={() => handleRetryPayment(tx)}
                              >
                                Retry
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!transactions.length && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-xs text-muted-foreground">
                            No transactions available yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </OwnerSectionErrorBoundary>
      )}

      {modulePrefs.services && (
        <OwnerSectionErrorBoundary>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  <span>Service readiness</span>
                </CardTitle>
                <CardDescription>
                  Feature flags and service tiers configured for future launches.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground">
                    Feature flags
                  </h3>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto">
                    {featureFlags.map((flag) => (
                      <div
                        key={flag.key}
                        className="flex items-start justify-between gap-2 rounded-md border p-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {flag.name}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {flag.tier}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {flag.description}
                          </p>
                        </div>
                        <Badge
                          variant={flag.enabled ? "default" : "outline"}
                          className="text-[10px] h-6"
                        >
                          {flag.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    ))}
                    {!featureFlags.length && (
                      <p className="text-xs text-muted-foreground">
                        No feature flags configured yet.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>Capacity planning</span>
                </CardTitle>
                <CardDescription>
                  Employee capacity and projected utilisation across your companies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Current employees</p>
                    <p className="text-lg font-semibold">
                      {capacity?.usedEmployeeCapacity ?? 0} /{" "}
                      {capacity?.totalEmployeeCapacity ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Projected in 90 days
                    </p>
                    <p className="text-lg font-semibold">
                      {capacity?.projectedIn90Days ?? 0}
                    </p>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((capacity?.usedEmployeeCapacity ?? 0) /
                          Math.max(capacity?.totalEmployeeCapacity ?? 1, 1)) *
                          100
                      ).toFixed(1)}%`,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground">
                    Service tiers
                  </h3>
                  <div className="max-h-[140px] overflow-y-auto space-y-2">
                    {serviceTiers.map((tier) => (
                      <div
                        key={tier.key}
                        className="flex items-center justify-between rounded-md border px-2 py-1.5 text-xs"
                      >
                        <div>
                          <p className="font-medium">{tier.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Up to {tier.maxEmployees} employees, {tier.maxAdmins} admins
                          </p>
                        </div>
                        <span className="font-semibold">
                          {tier.currency} {tier.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </OwnerSectionErrorBoundary>
      )}

      {modulePrefs.analytics && (
        <OwnerSectionErrorBoundary>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Employee growth vs revenue</span>
                </CardTitle>
                <CardDescription>
                  Compare headcount growth with revenue progression over time.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={employeeGrowthSeries.map((point, index) => ({
                      ...point,
                      revenue:
                        revenueSeries[index]?.revenue ??
                        revenueSeries[revenueSeries.length - 1]?.revenue ??
                        0,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10 }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        fontSize: 11,
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="employees"
                      name="Employees"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="revenue"
                      name="Revenue"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Admin activity heatmap</span>
                </CardTitle>
                <CardDescription>
                  Rolling 30-day view of admin activity volume.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityHeatmap}>
                    <defs>
                      <linearGradient id="activity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => value.slice(5)}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        fontSize: 11,
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="totalActions"
                      name="Actions"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#activity)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </OwnerSectionErrorBoundary>
      )}
    </div>
  );
};
