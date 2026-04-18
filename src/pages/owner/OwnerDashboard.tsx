import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardAnalytics, type DashboardAnalytics } from "@/services/api/ownerApi";
import { toast } from "@/hooks/use-toast";
import { Loader2, Ticket, AlertCircle, CheckCircle, Clock } from "lucide-react";

// ─── COMPONENTS ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, badge, badgePositive, accent, icon }: any) {
  return (
    <Card className="relative overflow-hidden border-border bg-card text-card-foreground">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent }} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{label}</span>
        <span className="text-xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold tracking-tighter text-foreground mb-1">{value}</div>
        <Badge 
          className={`text-[10px] font-bold rounded-full px-2 py-0 border-none ${
            badgePositive 
              ? "bg-green-500/10 text-green-500" 
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {badge}
        </Badge>
      </CardContent>
    </Card>
  );
}

export const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, 60000);
    
    const handleTicketResolved = () => {
      fetchDashboardData();
    };
    
    window.addEventListener('ticketResolved', handleTicketResolved);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('ticketResolved', handleTicketResolved);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const openTicketsCount = analytics.summary.openTickets || 0;

  return (
    <div className="space-y-8 p-6 bg-background min-h-full text-foreground">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Overview</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Siddhesh 👋 — Here's your business snapshot</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard 
          label="Monthly Revenue" 
          value={`₹${analytics.summary.monthlyRecurringRevenue.toLocaleString()}`} 
          badge="Updated in real-time" 
          badgePositive 
          accent="linear-gradient(90deg,#38bdf8,#818cf8)" 
          icon="💰" 
        />
        <KpiCard 
          label="Total Companies" 
          value={analytics.summary.totalCompanies.toString()} 
          badge={`${analytics.recentCompanies.length} new this month`} 
          badgePositive 
          accent="linear-gradient(90deg,#4ade80,#22d3ee)" 
          icon="🏢" 
        />
        <KpiCard 
          label="Active Subscriptions" 
          value={analytics.summary.activeSubscriptions.toString()} 
          badge={`${analytics.summary.expiredSubscriptions} expired`} 
          badgePositive={analytics.summary.expiredSubscriptions === 0} 
          accent="linear-gradient(90deg,#a78bfa,#f472b6)" 
          icon="📦" 
        />
        <KpiCard 
          label="Total Employees" 
          value={analytics.summary.totalEmployees.toLocaleString()} 
          badge="Across all companies" 
          badgePositive 
          accent="linear-gradient(90deg,#fb923c,#f43f5e)" 
          icon="👥" 
        />
        <KpiCard 
          label="Open Tickets" 
          value={openTicketsCount.toString()} 
          badge={openTicketsCount === 0 ? "All clear" : "Needs attention"} 
          badgePositive={openTicketsCount === 0} 
          accent="linear-gradient(90deg,#ef4444,#f97316)" 
          icon="🎫" 
        />
      </div>

      {/* Revenue Chart + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Revenue Trend</CardTitle>
            <span className="text-xs text-muted-foreground">Last 8 months</span>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics.revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} />
                <YAxis className="text-muted-foreground" tick={{ fontSize: 11, fill: "currentColor" }} tickFormatter={v => `₹${v/1000}k`} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 10, color: "hsl(var(--card-foreground))", fontSize: 12 }}
                  itemStyle={{ color: "hsl(var(--card-foreground))" }}
                  formatter={(v: any) => [`₹${v.toLocaleString()}`, ""]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={2} fill="url(#revGrad)" name="Total Revenue" />
                <Area type="monotone" dataKey="new" stroke="#818cf8" strokeWidth={2} fill="url(#newGrad)" name="New Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={analytics.planDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {analytics.planDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 10, color: "hsl(var(--card-foreground))", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-4">
              {analytics.planDistribution.map(p => (
                <div key={p.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: p.color }} />
                    <span className="text-xs text-muted-foreground">{p.name}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{p.value} companies</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent companies + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Recent Companies</CardTitle>
            <Button variant="link" className="text-xs text-primary p-0 h-auto" onClick={() => navigate('/owner/companies')}>View all →</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.recentCompanies.map(c => (
              <div key={c.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#38bdf8] to-[#818cf8] flex items-center justify-center text-sm font-black text-white">
                    {c.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.employees} employees · {c.plan}</div>
                  </div>
                </div>
                <Badge 
                  className={`text-[10px] font-bold rounded-full px-2 py-0 border-none ${
                    c.status === "Active" 
                      ? "bg-green-500/10 text-green-500" 
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {c.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Recent Activity</CardTitle>
            {analytics.recentActivity.some(a => a.type === 'ticket') && (
              <Button variant="link" className="text-xs text-primary p-0 h-auto" onClick={() => navigate('/owner/support')}>View all tickets →</Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              analytics.recentActivity.map((a, i) => (
                <div key={i} className="flex gap-3 py-2 border-b border-border/50 last:border-0">
                  {a.type === 'ticket' ? (
                    <>
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-orange-500" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm text-foreground leading-tight flex-1">{a.text}</div>
                          <Badge 
                            className={`text-[9px] font-bold rounded-full px-1.5 py-0 h-auto border-none ${
                              a.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                              a.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                              a.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-green-500/10 text-green-500'
                            }`}
                          >
                            {a.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-muted-foreground">{a.time}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] h-auto p-0 text-primary hover:underline"
                            onClick={() => navigate('/owner/support')}
                          >
                            View →
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div 
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          a.type === 'signup' ? 'bg-green-500' : 
                          a.type === 'payment' ? 'bg-blue-500' : 
                          a.type === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                        }`} 
                      />
                      <div className="flex-1">
                        <div className="text-sm text-foreground leading-tight">{a.text}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">{a.time}</div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};