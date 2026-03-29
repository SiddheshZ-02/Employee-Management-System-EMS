import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
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

const planData = [
  { name: "Basic", value: 38, color: "#4ade80" },
  { name: "Pro", value: 45, color: "#38bdf8" },
  { name: "Enterprise", value: 17, color: "#a78bfa" },
];

const companies = [
  { id: 1, name: "TechCorp Pvt Ltd", employees: 120, plan: "Pro", status: "Active" },
  { id: 2, name: "Alpha Solutions", employees: 34, plan: "Basic", status: "Expired" },
  { id: 3, name: "Nexus IT Services", employees: 450, plan: "Enterprise", status: "Active" },
  { id: 4, name: "BlueSky Logistics", employees: 88, plan: "Pro", status: "Active" },
];

const activity = [
  { type: "signup", text: "Nexus IT Services signed up — Enterprise Plan", time: "2 min ago" },
  { type: "payment", text: "TechCorp Pvt Ltd renewed — ₹84,000 received", time: "1 hr ago" },
  { type: "warning", text: "Alpha Solutions plan expired — 3 days overdue", time: "3 hrs ago" },
  { type: "alert", text: "Spark Analytics suspended — payment failed", time: "Yesterday" },
];

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
  return (
    <div className="space-y-8 p-6 bg-background min-h-full text-foreground">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Overview</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Siddhesh 👋 — Here's your business snapshot</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Monthly Revenue" value="₹1,12,000" badge="↑ 18% vs last month" badgePositive accent="linear-gradient(90deg,#38bdf8,#818cf8)" icon="💰" />
        <KpiCard label="Total Companies" value="7" badge="↑ 2 new this month" badgePositive accent="linear-gradient(90deg,#4ade80,#22d3ee)" icon="🏢" />
        <KpiCard label="Active Subscriptions" value="5" badge="2 expired / suspended" badgePositive={false} accent="linear-gradient(90deg,#a78bfa,#f472b6)" icon="📦" />
        <KpiCard label="Total Employees" value="1,101" badge="Across all companies" badgePositive accent="linear-gradient(90deg,#fb923c,#f43f5e)" icon="👥" />
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
              <AreaChart data={revenueData}>
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
                <Pie data={planData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {planData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 10, color: "hsl(var(--card-foreground))", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-4">
              {planData.map(p => (
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
            <Button variant="link" className="text-xs text-primary p-0 h-auto">View all →</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {companies.map(c => (
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
          <CardHeader>
            <CardTitle className="text-sm font-bold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3 py-2 border-b border-border/50 last:border-0">
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
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
