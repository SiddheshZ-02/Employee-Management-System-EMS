import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Building2,
  Edit,
  Save,
  X,
  Mail,
  Globe,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Loader2
} from "lucide-react";
import { getCompanyById, updateCompany, updateCompanySubscription } from "@/services/api/ownerApi";

interface CompanyDetails {
  _id: string;
  name: string;
  registrationDate: string;
  domain: string;
  adminName: string;
  email: string;
  plan: string;
  amount: number;
  startDate: string;
  renewalDate: string;
  daysLeft: number;
  status: "Active" | "Inactive" | "Pending";
  employeeCount: number;
}

const PRICING_PLANS = [
  {
    name: "Free Trial",
    key: "free",
    durationDays: 15,
    maxEmployees: 25,
    basePrice: 0,
    extraEmployeePrice: 0,
    features: ["All features unlocked"],
  },
  {
    name: "Pro Plan",
    key: "pro",
    maxEmployees: 50,
    basePrice: 999,
    extraEmployeePrice: 20,
    features: ["Up to 50 employees INCLUDED", "₹20 per extra employee"],
  },
  {
    name: "Premium Plan",
    key: "premium",
    maxEmployees: 100,
    basePrice: 1999,
    extraEmployeePrice: 15,
    features: ["Up to 100 employees INCLUDED", "₹15 per extra employee"],
  },
];

export const CompanyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [editMode, setEditMode] = useState<"none" | "profile" | "renewal">("none");
  const [editForm, setEditForm] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await getCompanyById(id!);
      if (response.success) {
        const data: any = response.data;
        const companyData: CompanyDetails = {
          _id: data._id,
          name: data.name,
          registrationDate: data.registrationDate || data.createdAt,
          domain: data.domain || "",
          adminName: data.adminName || "",
          email: data.email || "",
          plan: data.subscription?.plan || "free",
          amount: data.subscription?.amount || 0,
          startDate: data.subscription?.startDate || data.createdAt,
          renewalDate: data.subscription?.renewalDate || data.createdAt,
          daysLeft: data.daysLeft || 0,
          status: data.status === "active" ? "Active" : "Inactive",
          employeeCount: data.employeeCount || 0,
        };
        setCompany(companyData);
        setEditForm(companyData);
      }
    } catch (error: any) {
      console.error("Error fetching company:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load company details",
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

  if (!company) {
    return <div className="p-8 text-center">Company not found</div>;
  }

  const handleEditProfile = () => {
    setEditMode("profile");
  };

  const handleRenewal = () => {
    setEditMode("renewal");
  };

  const calculateAmount = (planKey: string, employeeCount: number) => {
    const selectedPlan = PRICING_PLANS.find(p => p.key === planKey);
    if (!selectedPlan) return 0;

    if (selectedPlan.key === "free") return 0;

    let total = selectedPlan.basePrice;
    if (employeeCount > selectedPlan.maxEmployees) {
      const extraEmployees = employeeCount - selectedPlan.maxEmployees;
      total += extraEmployees * selectedPlan.extraEmployeePrice;
    }
    return total;
  };

  const handleCancel = () => {
    setEditMode("none");
    setEditForm(company);
  };

  const handleSave = async () => {
    if (!editForm || !id) return;
    
    setSubmitting(true);
    try {
      if (editMode === "profile") {
        const response = await updateCompany(id, {
          name: editForm.name,
          domain: editForm.domain,
          status: editForm.status.toLowerCase(),
        });
        
        if (response.success) {
          toast({
            title: "Success",
            description: "Profile details updated successfully.",
          });
          fetchCompany();
          setEditMode("none");
        }
      } else if (editMode === "renewal") {
        const planKey = editForm.plan.toLowerCase();
        const response = await updateCompanySubscription(id, {
          plan: planKey,
          employeeCount: editForm.employeeCount,
        });
        
        if (response.success) {
          toast({
            title: "Success",
            description: "Subscription updated successfully.",
          });
          fetchCompany();
          setEditMode("none");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Active</Badge>;
      case "Inactive":
        return <Badge variant="destructive" className="gap-1.5"><X className="h-3.5 w-3.5" />Inactive</Badge>;
      case "Pending":
        return <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 gap-1.5"><AlertCircle className="h-3.5 w-3.5" />Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/owner/companies")} className="rounded-full shadow-sm hover:bg-muted transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
              {editMode === "none" && getStatusBadge(company.status)}
            </div>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              {company.domain}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {editMode !== "none" ? (
            <>
              <Button variant="outline" onClick={handleCancel} className="gap-2 px-6" disabled={submitting}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="gap-2 px-6 shadow-md shadow-primary/20" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleRenewal} variant="outline" className="gap-2 px-6 border-primary text-primary hover:bg-primary/5">
                <Clock className="h-4 w-4" />
                Renewal
              </Button>
              <Button onClick={handleEditProfile} className="gap-2 px-6 shadow-md shadow-primary/20">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
              <span className="text-lg font-bold">₹</span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Annual Amount</p>
              <p className="text-xl font-bold">₹{company.amount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${company.employeeCount > (PRICING_PLANS.find(p => p.key === company.plan)?.maxEmployees || 0) ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Employees</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold">{company.employeeCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">/ {PRICING_PLANS.find(p => p.key === company.plan)?.maxEmployees} included</p>
              </div>
              {company.employeeCount > (PRICING_PLANS.find(p => p.key === company.plan)?.maxEmployees || 0) && (
                <p className="text-[10px] text-amber-600 font-bold mt-0.5">
                  +{company.employeeCount - (PRICING_PLANS.find(p => p.key === company.plan)?.maxEmployees || 0)} extra charged
                </p>
              )}
            </div>
          </CardContent>
        </Card>
       
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${company.daysLeft < 30 ? "bg-rose-500/10 text-rose-600" : "bg-blue-500/10 text-blue-600"}`}>
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Renewal Window</p>
              <p className={`text-xl font-bold ${company.daysLeft < 30 ? "text-rose-600" : ""}`}>{company.daysLeft} Days Left</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reg. Date</p>
              <p className="text-xl font-bold">{new Date(company.registrationDate).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Organization & Admin */}
        <div className="space-y-6">
          <Card className={`border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden transition-all ${editMode === "profile" ? "ring-2 ring-primary" : ""}`}>
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Organization Details
              </CardTitle>
              <CardDescription>Primary identification and branding settings.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Legal Entity Name</Label>
                  {editMode === "profile" ? (
                    <Input value={editForm?.name} onChange={(e) => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)} className="bg-background/50" />
                  ) : (
                    <p className="text-lg font-medium">{company.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Digital Domain</Label>
                  {editMode === "profile" ? (
                    <Input value={editForm?.domain} onChange={(e) => setEditForm(prev => prev ? {...prev, domain: e.target.value} : null)} className="bg-background/50" />
                  ) : (
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      {company.domain}
                    </p>
                  )}
                </div>
                {editMode === "profile" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Operating Status</Label>
                    <Select value={editForm?.status} onValueChange={(val: any) => setEditForm(prev => prev ? {...prev, status: val} : null)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={`border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden transition-all ${editMode === "profile" ? "ring-2 ring-primary" : ""}`}>
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Administrative Oversight
              </CardTitle>
              <CardDescription>Primary root account for system management.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Primary Admin Name</Label>
                  {editMode === "profile" ? (
                    <Input value={editForm?.adminName} onChange={(e) => setEditForm(prev => prev ? {...prev, adminName: e.target.value} : null)} className="bg-background/50" />
                  ) : (
                    <p className="text-lg font-medium">{company.adminName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Communication Email</Label>
                  {editMode === "profile" ? (
                    <Input value={editForm?.email} onChange={(e) => setEditForm(prev => prev ? {...prev, email: e.target.value} : null)} className="bg-background/50" />
                  ) : (
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      {company.email}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Subscription */}
        <div className="space-y-6">
          <Card className={`border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden transition-all h-full ${editMode === "renewal" ? "ring-2 ring-primary" : ""}`}>
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Subscription Lifecycle
              </CardTitle>
              <CardDescription>Billing cycles and service level agreements.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service Tier</Label>
                  {editMode === "renewal" ? (
                    <Select 
                      value={editForm?.plan} 
                      onValueChange={(val) => {
                        if (editForm) {
                          const newAmount = calculateAmount(val, editForm.employeeCount);
                          setEditForm({ ...editForm, plan: val, amount: newAmount });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select Plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICING_PLANS.map(p => (
                          <SelectItem key={p.key} value={p.key}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-sm px-3 py-1 font-bold w-fit">
                        {company.plan}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground italic">
                        {PRICING_PLANS.find(p => p.key === company.plan)?.features.join(" • ")}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recurring Amount</Label>
                  {editMode === "renewal" ? (
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                      <Input 
                        type="number" 
                        readOnly
                        value={editForm?.amount} 
                        className="pl-7 bg-muted/50 cursor-not-allowed" 
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Automatically calculated based on plan and employee count.</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-black text-primary">₹{company.amount.toLocaleString()}<span className="text-xs font-normal text-muted-foreground ml-1">/ month</span></p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee Count</Label>
                  {editMode === "renewal" ? (
                    <div className="relative">
                      <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        value={editForm?.employeeCount} 
                        onChange={(e) => {
                          const count = Number(e.target.value);
                          if (editForm) {
                            const newAmount = calculateAmount(editForm.plan, count);
                            setEditForm({ ...editForm, employeeCount: count, amount: newAmount });
                          }
                        }} 
                        className="pl-9 bg-background/50" 
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xl font-bold">{company.employeeCount.toLocaleString()}</p>
                      <div className="flex flex-col text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                          {PRICING_PLANS.find(p => p.key === company.plan)?.maxEmployees} included in plan
                        </span>
                        {company.employeeCount > (PRICING_PLANS.find(p => p.key === company.plan)?.maxEmployees || 0) && (
                          <span className="flex items-center gap-1 text-amber-600 font-bold mt-0.5">
                            <AlertCircle className="h-2.5 w-2.5" />
                            {company.employeeCount - (PRICING_PLANS.find(p => p.key === company.plan)?.maxEmployees || 0)} extra employees
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-muted">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <Label className="text-xs font-semibold uppercase">Activation Date</Label>
                  </div>
                  {editMode === "renewal" ? (
                    <Input type="date" value={editForm?.startDate?.split('T')[0]} onChange={(e) => setEditForm(prev => prev ? {...prev, startDate: e.target.value} : null)} className="bg-background/50" />
                  ) : (
                    <p className="text-lg font-medium">{new Date(company.startDate).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <Label className="text-xs font-semibold uppercase">Renewal Deadline</Label>
                  </div>
                  {editMode === "renewal" ? (
                    <Input type="date" value={editForm?.renewalDate?.split('T')[0]} onChange={(e) => setEditForm(prev => prev ? {...prev, renewalDate: e.target.value} : null)} className="bg-background/50" />
                  ) : (
                    <div className="space-y-1">
                      <p className="text-lg font-medium">{new Date(company.renewalDate).toLocaleDateString()}</p>
                      <p className={`text-xs font-bold px-2 py-0.5 rounded w-fit ${company.daysLeft < 30 ? "bg-rose-500/10 text-rose-600" : "bg-blue-500/10 text-blue-600"}`}>
                        {company.daysLeft} days remaining
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {editMode === "none" && (
                <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Subscription Health</span>
                    <span className="font-bold text-primary">Excellent</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                    All administrative and financial records are compliant with the current service level agreement.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
