import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const tickets = [
  { id: "TKT-001", company: "TechCorp Pvt Ltd", issue: "Unable to export payroll PDF", priority: "High", status: "Open", time: "2 hrs ago" },
  { id: "TKT-002", company: "Alpha Solutions", issue: "Admin password reset request", priority: "Medium", status: "Open", time: "5 hrs ago" },
  { id: "TKT-003", company: "BlueSky Logistics", issue: "Leave module not syncing", priority: "Low", status: "Resolved", time: "1 day ago" },
  { id: "TKT-004", company: "InnovateMind", issue: "Billing invoice not received", priority: "Medium", status: "Open", time: "2 days ago" },
];

export const SupportPage = () => {
  const getBadgeStyle = (type: string) => {
    const map: any = {
      Open: "bg-blue-500/10 text-blue-500",
      Resolved: "bg-green-500/10 text-green-500",
      High: "bg-red-500/10 text-red-500",
      Medium: "bg-orange-500/10 text-orange-500",
      Low: "bg-green-500/10 text-green-500",
    };
    return `text-[11px] font-bold px-2.5 py-0.5 rounded-full border-none ${map[type] || ""}`;
  };

  return (
    <div className="space-y-8 p-6 bg-background min-h-full text-foreground">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">Resolve issues raised by your client companies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Open Tickets", value: "3", color: "#f87171" },
          { label: "Resolved Today", value: "1", color: "#4ade80" },
          { label: "Avg Response", value: "2.4 hrs", color: "#38bdf8" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border relative overflow-hidden pt-1">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: stat.color }} />
            <CardContent className="p-5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</div>
              <div className="text-3xl font-extrabold tracking-tighter">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <CardTitle className="text-sm font-bold">All Tickets</CardTitle>
          <div className="flex gap-2">
            {["All", "Open", "Resolved"].map(f => (
              <Button key={f} variant="outline" size="sm" className="font-bold text-xs">
                {f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                {["Ticket ID", "Company", "Issue", "Priority", "Status", "Time", "Action"].map(h => (
                  <TableHead key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-6 py-3 border-none">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map(t => (
                <TableRow key={t.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors border-none">
                  <TableCell className="px-6 py-4 font-mono text-primary text-xs border-none">{t.id}</TableCell>
                  <TableCell className="px-6 text-sm border-none">{t.company}</TableCell>
                  <TableCell className="px-6 text-sm border-none">{t.issue}</TableCell>
                  <TableCell className="px-6 border-none"><Badge className={getBadgeStyle(t.priority)}>{t.priority}</Badge></TableCell>
                  <TableCell className="px-6 border-none"><Badge className={getBadgeStyle(t.status)}>{t.status}</Badge></TableCell>
                  <TableCell className="px-6 text-xs text-muted-foreground border-none">{t.time}</TableCell>
                  <TableCell className="px-6 border-none">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 h-auto hover:bg-primary/20">Resolve</Button>
                      <Button variant="ghost" size="sm" className="bg-muted text-muted-foreground text-[10px] font-bold px-2.5 py-1 h-auto hover:bg-muted/80">View</Button>
                    </div>
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
