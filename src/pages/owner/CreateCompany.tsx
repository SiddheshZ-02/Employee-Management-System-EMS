import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createCompany } from "@/services/api/ownerApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Building2, 
  UserCircle2, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Loader2, 
  Globe, 
  Upload, 
  Briefcase, 
  Calendar,
  Camera,
  X,
  Activity
} from "lucide-react";

const companySchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  domain: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  registrationDate: z.string().min(1, "Registration date is required"),
  status: z.enum(["active", "deactive"]),
  adminName: z.string().min(2, "Admin name must be at least 2 characters"),
  adminEmail: z.string().email("Invalid email address"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export const CreateCompany = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      registrationDate: new Date().toISOString().split("T")[0],
      domain: "",
      industry: "",
      status: "active",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: CompanyFormValues) => {
    setSubmitting(true);
    
    try {
      const response = await createCompany({
        companyName: data.companyName,
        domain: data.domain || "",
        industry: data.industry || "",
        registrationDate: data.registrationDate,
        status: data.status,
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        plan: "free", // Can be enhanced to select plan
      });

      if (response.success) {
        toast({
          title: "Success!",
          description: `${data.companyName} and its administrator have been successfully registered.`,
        });
        navigate("/owner/companies");
      }
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/owner/companies")}
            className="rounded-full hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Enterprise Onboarding</h1>
            <p className="text-muted-foreground text-sm">Configure a new company profile and administrative control center.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/owner/companies")}
            disabled={submitting}
            className="hidden md:flex"
          >
            Cancel
          </Button>
          <Button 
            form="onboarding-form"
            type="submit" 
            disabled={submitting} 
            className="min-w-[140px] shadow-lg shadow-primary/20"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Complete Onboarding"
            )}
          </Button>
        </div>
      </div>

      <form id="onboarding-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Branding & Core Details (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Logo & Status Section */}
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden border-l-4 border-primary/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Identity & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload - More Compact & Integrated */}
              <div className="flex flex-col items-center justify-center py-4 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-all group relative">
                <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center overflow-hidden border-2 border-muted-foreground/10 group-hover:scale-105 transition-transform duration-300">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-xs font-semibold text-foreground/70 mb-1 uppercase tracking-wider">Company Logo</p>
                  <p className="text-[10px] text-muted-foreground mb-3 italic">(PNG, JPG, SVG - Max 2MB)</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 text-[10px] px-3 font-bold"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      CHANGE
                    </Button>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] px-3 font-bold text-destructive hover:bg-destructive/10"
                        onClick={removeLogo}
                      >
                        <X className="h-3 w-3 mr-1" />
                        REMOVE
                      </Button>
                    )}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
              </div>

              {/* Status Selector */}
              <div className="space-y-2 pt-2">
                <Label htmlFor="status" className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Operation Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full h-10 border-muted-foreground/20 focus:ring-primary/20">
                        <div className="flex items-center gap-2">
                          <Activity className={`h-4 w-4 ${field.value === 'active' ? 'text-green-500' : 'text-amber-500'}`} />
                          <SelectValue placeholder="Select Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" className="text-green-600 font-medium">Active (Operational)</SelectItem>
                        <SelectItem value="deactive" className="text-amber-600 font-medium">Deactive (Suspended)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card (Visual Polish) */}
          <Card className="border-none shadow-md bg-primary/5 text-primary-foreground/90 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building2 className="h-20 w-20" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Onboarding Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Company Name:</span>
                  <span className="font-semibold text-foreground truncate max-w-[120px]">
                    {register("companyName").name ? "Pending Input" : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Admin Access:</span>
                  <span className="font-semibold text-foreground truncate max-w-[120px]">
                    {register("adminName").name ? "Required" : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Configuration (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Organization Configuration */}
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm border-l-4 border-primary/40">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary/80 mb-1">
                <Globe className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Configuration Phase 01</span>
              </div>
              <CardTitle className="text-xl font-bold">Organization Architecture</CardTitle>
              <CardDescription className="text-xs">Define the primary operational parameters for the enterprise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-xs font-semibold text-foreground/80">Legal Entity Name</Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="companyName"
                      className={`pl-10 h-11 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20 ${errors.companyName ? "border-destructive ring-destructive/20" : ""}`}
                      placeholder="e.g. Acme International Ltd."
                      {...register("companyName")}
                    />
                  </div>
                  {errors.companyName && <p className="text-[10px] font-medium text-destructive mt-1 flex items-center gap-1"><X className="h-3 w-3" /> {errors.companyName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="domain" className="text-xs font-semibold text-foreground/80">Corporate Domain</Label>
                  <div className="relative group">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="domain"
                      className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20"
                      placeholder="acme-intl.com"
                      {...register("domain")}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="industry" className="text-xs font-semibold text-foreground/80">Market Industry</Label>
                  <div className="relative group">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="industry"
                      className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20"
                      placeholder="e.g. Technology, Fintech, Logistics"
                      {...register("industry")}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="registrationDate" className="text-xs font-semibold text-foreground/80">Commencement Date</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="registrationDate"
                      type="date"
                      className={`pl-10 h-11 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20 ${errors.registrationDate ? "border-destructive ring-destructive/20" : ""}`}
                      {...register("registrationDate")}
                    />
                  </div>
                  {errors.registrationDate && <p className="text-[10px] font-medium text-destructive mt-1 flex items-center gap-1"><X className="h-3 w-3" /> {errors.registrationDate.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Administrative Control */}
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm border-l-4 border-primary/40">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary/80 mb-1">
                <UserCircle2 className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Configuration Phase 02</span>
              </div>
              <CardTitle className="text-xl font-bold">Administrative Oversight</CardTitle>
              <CardDescription className="text-xs">Establish the primary root account for the enterprise management system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="adminName" className="text-xs font-semibold text-foreground/80">Primary Admin Name</Label>
                  <div className="relative group">
                    <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="adminName"
                      className={`pl-10 h-11 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20 ${errors.adminName ? "border-destructive ring-destructive/20" : ""}`}
                      placeholder="Full legal name"
                      {...register("adminName")}
                    />
                  </div>
                  {errors.adminName && <p className="text-[10px] font-medium text-destructive mt-1 flex items-center gap-1"><X className="h-3 w-3" /> {errors.adminName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adminEmail" className="text-xs font-semibold text-foreground/80">Corporate Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="adminEmail"
                      type="email"
                      className={`pl-10 h-11 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20 ${errors.adminEmail ? "border-destructive ring-destructive/20" : ""}`}
                      placeholder="admin@enterprise.com"
                      {...register("adminEmail")}
                    />
                  </div>
                  {errors.adminEmail && <p className="text-[10px] font-medium text-destructive mt-1 flex items-center gap-1"><X className="h-3 w-3" /> {errors.adminEmail.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminPassword" className="text-xs font-semibold text-foreground/80">System Access Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="adminPassword"
                    type="password"
                    className={`pl-10 h-11 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20 ${errors.adminPassword ? "border-destructive ring-destructive/20" : ""}`}
                    placeholder="••••••••••••"
                    {...register("adminPassword")}
                  />
                </div>
                {errors.adminPassword ? (
                  <p className="text-[10px] font-medium text-destructive mt-1 flex items-center gap-1"><X className="h-3 w-3" /> {errors.adminPassword.message}</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground italic mt-1 ml-1">Must contain at least 6 characters for enterprise security.</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex justify-end gap-3 py-4 md:hidden">
              <Button type="submit" disabled={submitting} className="w-full h-11">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Onboarding"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

