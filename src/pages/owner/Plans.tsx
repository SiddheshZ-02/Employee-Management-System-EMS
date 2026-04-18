import { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getPlans, getPlanAnalytics, createPlan, updatePlan, deletePlan, type Plan } from "@/services/api/ownerApi";
import { Loader2, Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const planColors: Record<string, string> = {
  Basic: "#4ade80",
  Pro: "#38bdf8",
  Enterprise: "#a78bfa",
  Free: "#94a3b8",
  Premium: "#f472b6",
};

export const PlansPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planStats, setPlanStats] = useState<Array<{ plan: string; revenue: number; companies: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    price: 0,
    maxEmployees: 0,
    maxAdmins: 1,
    features: "",
    description: "",
    billingCycle: "yearly" as "monthly" | "yearly",
    sortOrder: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [plansResponse, analyticsResponse] = await Promise.all([
        getPlans(),
        getPlanAnalytics(),
      ]);

      if (plansResponse.success) {
        setPlans(plansResponse.data);
      }

      if (analyticsResponse.success) {
        setPlanStats(analyticsResponse.data);
      }
    } catch (err) {
      console.error("Error fetching plans data:", err);
      setError("Failed to load plans data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (planKey: string) => {
    const colorMap: Record<string, string> = {
      basic: "bg-green-500/10 text-green-500",
      pro: "bg-blue-500/10 text-blue-500",
      enterprise: "bg-purple-500/10 text-purple-500",
      free: "bg-gray-500/10 text-gray-500",
      premium: "bg-pink-500/10 text-pink-500",
    };
    const color = colorMap[planKey.toLowerCase()] || "bg-gray-500/10 text-gray-500";
    return `text-[11px] font-bold px-2.5 py-0.5 rounded-full border-none ${color}`;
  };

  const getPlanColor = (planKey: string) => {
    return planColors[planKey.charAt(0).toUpperCase() + planKey.slice(1).toLowerCase()] || "#94a3b8";
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      key: "",
      price: 0,
      maxEmployees: 0,
      maxAdmins: 1,
      features: "",
      description: "",
      billingCycle: "yearly",
      sortOrder: plans.length,
    });
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    if (!plan._id) {
      toast.error("Cannot edit this plan. Please refresh the page.");
      return;
    }
    
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      key: plan.key,
      price: plan.price,
      maxEmployees: plan.maxEmployees,
      maxAdmins: plan.maxAdmins || 1,
      features: plan.features.join("\n"),
      description: "",
      billingCycle: "yearly",
      sortOrder: 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.key || formData.price < 0 || formData.maxEmployees < 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingPlan && !editingPlan._id) {
      toast.error("Invalid plan ID. Please refresh the page.");
      return;
    }

    try {
      setSubmitting(true);
      
      const planData = {
        name: formData.name,
        key: formData.key.toLowerCase(),
        price: formData.price,
        maxEmployees: formData.maxEmployees,
        maxAdmins: formData.maxAdmins,
        features: formData.features.split("\n").filter(f => f.trim()),
        description: formData.description,
        billingCycle: formData.billingCycle,
        sortOrder: formData.sortOrder,
      };

      if (editingPlan) {
        const response = await updatePlan(editingPlan._id!, planData);
        if (response.success) {
          toast.success("Plan updated successfully");
          setIsDialogOpen(false);
          fetchData();
        }
      } else {
        const response = await createPlan(planData);
        if (response.success) {
          toast.success("Plan created successfully");
          setIsDialogOpen(false);
          fetchData();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!id) {
      toast.error("Cannot delete this plan. Please refresh the page.");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the plan "${name}"?`)) {
      return;
    }

    try {
      const response = await deletePlan(id);
      if (response.success) {
        toast.success("Plan deleted successfully");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete plan");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-background min-h-full text-foreground">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Plan Management</h1>
          <p className="text-sm text-muted-foreground">Configure what each plan offers to your clients</p>
        </div>
        <Button 
          onClick={handleCreatePlan}
          className="bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-lg text-sm border-none shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const color = getPlanColor(plan.key);
          const stat = planStats.find(s => s.plan === plan.key);
          return (
            <Card key={plan._id || plan.key} className="bg-card border-border relative overflow-hidden pt-1">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-extrabold tracking-tight">{plan.name}</span>
                  <Badge className={getBadgeStyle(plan.key)}>
                    {stat?.companies || 0} companies
                  </Badge>
                </div>
                <div className="text-4xl font-black tracking-tighter mb-1" style={{ color }}>
                  ₹{plan.price.toLocaleString()}
                  <span className="text-sm font-medium text-muted-foreground tracking-normal ml-1">/mo</span>
                </div>
                <div className="text-xs text-muted-foreground font-bold mb-6 uppercase tracking-wider">
                  Up to {plan.maxEmployees === Infinity ? "Unlimited" : plan.maxEmployees} employees
                </div>
                <div className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span style={{ color }} className="font-bold">✓</span> {f}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => handleEditPlan(plan)}
                    disabled={!plan._id}
                    className="flex-1 bg-muted border-none text-muted-foreground font-bold text-xs py-2 h-auto hover:bg-muted/80 disabled:opacity-50"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => plan._id && handleDeletePlan(plan._id, plan.name)}
                    disabled={!plan._id}
                    className="flex-1 bg-red-500/10 border-none text-red-500 font-bold text-xs py-2 h-auto hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
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
                {planStats.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getPlanColor(_entry.plan)} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
            <DialogDescription>
              {editingPlan ? "Update the plan details" : "Add a new subscription plan for your clients"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Basic, Pro, Enterprise"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="key">Plan Key *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase() })}
                  placeholder="e.g., basic, pro, enterprise"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billingCycle">Billing Cycle</Label>
                <select
                  id="billingCycle"
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as "monthly" | "yearly" })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxEmployees">Max Employees *</Label>
                <Input
                  id="maxEmployees"
                  type="number"
                  value={formData.maxEmployees}
                  onChange={(e) => setFormData({ ...formData, maxEmployees: Number(e.target.value) })}
                  placeholder="Use 999999 for unlimited"
                  min="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxAdmins">Max Admins</Label>
                <Input
                  id="maxAdmins"
                  type="number"
                  value={formData.maxAdmins}
                  onChange={(e) => setFormData({ ...formData, maxAdmins: Number(e.target.value) })}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Employee Management\nLeave Tracking\nBasic Reports\nEmail Support"
                rows={5}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
                disabled={submitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingPlan ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editingPlan ? "Update Plan" : "Create Plan"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

