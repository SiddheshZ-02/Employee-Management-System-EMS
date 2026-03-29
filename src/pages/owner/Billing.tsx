import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const revenueData = [
  { month: "Aug", revenue: 48000, new: 12000 },
  { month: "Sep", revenue: 55000, new: 18000 },
  { month: "Oct", revenue: 61000, new: 14000 },
  { month: "Nov", revenue: 58000, new: 9000 },
  { month: "Dec", revenue: 72000, new: 21000 },
  { month: "Jan", revenue: 88000, new: 27000 },
  { month: "Feb", revenue: 95000, new: 19000 },
  { month: "Mar", revenue: 112000, new: 33000 },
];

const invoices = [
  { id: "INV-2024-089", company: "Nexus IT Services", amount: 5999, plan: "Enterprise", status: "Paid", date: "Mar 1, 2025" },
  { id: "INV-2024-088", company: "TechCorp Pvt Ltd", amount: 2499, plan: "Pro", status: "Paid", date: "Feb 28, 2025" },
  { id: "INV-2024-087", company: "Alpha Solutions", amount: 999, plan: "Basic", status: "Overdue", date: "Feb 15, 2025" },
  { id: "INV-2024-086", company: "BlueSky Logistics", amount: 2499, plan: "Pro", status: "Paid", date: "Feb 10, 2025" },
  { id: "INV-2024-085", company: "Spark Analytics", amount: 2499, plan: "Pro", status: "Failed", date: "Feb 5, 2025" },
];

export const BillingPage = () => {
  const getBadgeStyle = (type: string) => {
    const map: any = {
      Paid: "bg-green-500/10 text-green-500",
      Overdue: "bg-red-500/10 text-red-500",
      Failed: "bg-rose-500/10 text-rose-500",
      Basic: "bg-blue-500/10 text-blue-500",
      Pro: "bg-purple-500/10 text-purple-500",
      Enterprise: "bg-indigo-500/10 text-indigo-500",
    };
    return `text-[11px] font-bold px-2.5 py-0.5 rounded-full border-none ${map[type] || ""}`;
  };

  return (
    <div className="space-y-8 p-6 bg-background min-h-full text-foreground">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Billing & Subscriptions</h1>
        <p className="text-sm text-muted-foreground">Track all invoices, payments, and subscription renewals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "MRR", value: "₹1,12,000", color: "#38bdf8", icon: "💰" },
          { label: "ARR", value: "₹13,44,000", color: "#4ade80", icon: "📈" },
          { label: "Pending", value: "₹3,498", color: "#fb923c", icon: "⏳" },
          { label: "Churn Rate", value: "2.1%", color: "#f87171", icon: "📉" },
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

      {/* Revenue Bar Chart */}
      <Card className="bg-card border-border p-6">
        <CardHeader className="px-0 pt-0 pb-6">
          <CardTitle className="text-sm font-bold">Monthly Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} />
              <YAxis className="text-muted-foreground" tick={{ fontSize: 11, fill: "currentColor" }} tickFormatter={v => `₹${v/1000}k`} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 10, color: "hsl(var(--card-foreground))", fontSize: 12 }} 
                cursor={{ fill: 'currentColor', opacity: 0.05 }}
                formatter={(v: any) => [`₹${v.toLocaleString()}`, ""]} 
              />
              <Bar dataKey="revenue" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Total Revenue" />
              <Bar dataKey="new" fill="#818cf8" radius={[6, 6, 0, 0]} name="New Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <CardTitle className="text-sm font-bold">All Invoices</CardTitle>
          <Button variant="ghost" className="bg-muted border-none text-muted-foreground font-bold text-[10px] px-3 py-1.5 h-auto hover:bg-muted/80">Export CSV</Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                {["Invoice ID", "Company", "Plan", "Amount", "Status", "Date", "Action"].map(h => (
                  <TableHead key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-6 py-3 border-none">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map(inv => (
                <TableRow key={inv.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors border-none">
                  <TableCell className="px-6 py-4 font-mono text-primary text-xs border-none">{inv.id}</TableCell>
                  <TableCell className="px-6 text-sm border-none">{inv.company}</TableCell>
                  <TableCell className="px-6 border-none"><Badge className={getBadgeStyle(inv.plan)}>{inv.plan}</Badge></TableCell>
                  <TableCell className="px-6 text-sm font-bold border-none">₹{inv.amount.toLocaleString()}</TableCell>
                  <TableCell className="px-6 border-none"><Badge className={getBadgeStyle(inv.status)}>{inv.status}</Badge></TableCell>
                  <TableCell className="px-6 text-xs text-muted-foreground border-none">{inv.date}</TableCell>
                  <TableCell className="px-6 border-none">
                    <button className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-md hover:bg-primary/20">Download</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
