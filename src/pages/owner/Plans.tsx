import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  { name: "Basic", price: 999, companies: 38, maxEmp: 50, features: ["Employee Management", "Leave Tracking", "Basic Reports", "Email Support"] },
  { name: "Pro", price: 2499, companies: 45, maxEmp: 200, features: ["All Basic", "Payroll Management", "Attendance", "Priority Support", "Custom Branding"] },
  { name: "Enterprise", price: 5999, companies: 17, maxEmp: "Unlimited", features: ["All Pro", "API Access", "Dedicated Manager", "SLA 99.9%", "White Label", "Multi-Branch"] },
];

const planStats = [
  { plan: "Basic", revenue: 37962, companies: 38 },
  { plan: "Pro", revenue: 112455, companies: 45 },
  { plan: "Enterprise", revenue: 101983, companies: 17 },
];

export const PlansPage = () => {
  const getBadgeStyle = (type: string) => {
    const map: any = {
      Basic: "bg-green-500/10 text-green-500",
      Pro: "bg-blue-500/10 text-blue-500",
      Enterprise: "bg-purple-500/10 text-purple-500",
    };
    return `text-[11px] font-bold px-2.5 py-0.5 rounded-full border-none ${map[type] || ""}`;
  };

  return (
    <div className="space-y-8 p-6 bg-background min-h-full text-foreground">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Plan Management</h1>
          <p className="text-sm text-muted-foreground">Configure what each plan offers to your clients</p>
        </div>
        <Button className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-lg text-sm border-none shadow-lg">
          + Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((p, idx) => {
          const colors = ["#4ade80", "#38bdf8", "#a78bfa"];
          const c = colors[idx];
          return (
            <Card key={p.name} className="bg-card border-border relative overflow-hidden pt-1">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: c }} />
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-extrabold tracking-tight">{p.name}</span>
                  <Badge className={getBadgeStyle(p.name)}>{p.companies} companies</Badge>
                </div>
                <div className="text-4xl font-black tracking-tighter mb-1" style={{ color: c }}>
                  ₹{p.price.toLocaleString()}
                  <span className="text-sm font-medium text-muted-foreground tracking-normal ml-1">/mo</span>
                </div>
                <div className="text-xs text-muted-foreground font-bold mb-6 uppercase tracking-wider">Up to {p.maxEmp} employees</div>
                <div className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span style={{ color: c }} className="font-bold">✓</span> {f}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-auto">
                  <Button variant="outline" className="flex-1 bg-muted border-none text-muted-foreground font-bold text-xs py-2 h-auto hover:bg-muted/80">Edit</Button>
                  <Button className="flex-1 bg-primary text-primary-foreground font-bold text-xs py-2 h-auto border-none">View Clients</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan comparison stats */}
      <Card className="bg-card border-border p-6">
        <CardHeader className="px-0 pt-0 pb-6">
          <CardTitle className="text-sm font-bold">Revenue by Plan</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={planStats} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis dataKey="plan" className="text-muted-foreground" tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} />
              <YAxis className="text-muted-foreground" tick={{ fontSize: 11, fill: "currentColor" }} tickFormatter={v => `₹${v/1000}k`} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 10, color: "hsl(var(--card-foreground))", fontSize: 12 }} 
                cursor={{ fill: 'currentColor', opacity: 0.05 }}
                formatter={(v: any) => [`₹${v.toLocaleString()}`, "Revenue"]} 
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {planStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#4ade80", "#38bdf8", "#a78bfa"][index % 3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

