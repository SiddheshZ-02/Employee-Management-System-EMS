import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Building2, UserCircle2, Mail, Lock, Briefcase, MapPin, ArrowLeft, Loader2, Globe } from "lucide-react";

export const CreateCompany = () => {
  const { token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    domain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminDepartment: "",
    adminPosition: "",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: "Not authenticated",
        description: "Please log in again as owner.",
        variant: "destructive",
      });
      return;
    }

    if (!form.companyName || !form.adminName || !form.adminEmail || !form.adminPassword) {
      toast({
        title: "Missing fields",
        description: "Company name and admin details are required.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/api/owner/companies", {
        method: "POST",
        token,
        body: {
          name: form.companyName,
          domain: form.domain || undefined,
          admin: {
            name: form.adminName,
            email: form.adminEmail,
            password: form.adminPassword,
            department: form.adminDepartment || undefined,
            position: form.adminPosition || undefined,
          },
        },
      });

      toast({
        title: "Success!",
        description: `${form.companyName} and its administrator have been successfully registered.`,
      });
      navigate("/owner/companies");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to create company.";
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/owner/companies")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Onboard New Enterprise</h1>
          <p className="text-muted-foreground">Register a new company and its primary administrator.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-2 bg-primary/80" />
            <CardHeader>
              <div className="flex items-center gap-2 mb-1 text-primary">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Company Information</span>
              </div>
              <CardTitle className="text-xl">Organization Details</CardTitle>
              <CardDescription>Basic information about the enterprise you are onboarding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyName"
                      className="pl-9"
                      value={form.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      placeholder="Acme International"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain" className="text-sm font-medium">Official Domain (Optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="domain"
                      className="pl-9"
                      value={form.domain}
                      onChange={(e) => handleChange("domain", e.target.value)}
                      placeholder="acme-intl.com"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1 italic">Example: company.com</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-2 bg-primary/60" />
            <CardHeader>
              <div className="flex items-center gap-2 mb-1 text-primary">
                <UserCircle2 className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Administrator Setup</span>
              </div>
              <CardTitle className="text-xl">Primary Admin Account</CardTitle>
              <CardDescription>This user will have full administrative access to the company dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="adminName" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <UserCircle2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminName"
                      className="pl-9"
                      value={form.adminName}
                      onChange={(e) => handleChange("adminName", e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminEmail"
                      type="email"
                      className="pl-9"
                      value={form.adminEmail}
                      onChange={(e) => handleChange("adminEmail", e.target.value)}
                      placeholder="john.doe@acme.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="adminPassword" className="text-sm font-medium">Initial Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminPassword"
                      type="password"
                      className="pl-9"
                      value={form.adminPassword}
                      onChange={(e) => handleChange("adminPassword", e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1">Must be at least 6 characters.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminDepartment" className="text-sm font-medium">Department (Optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminDepartment"
                      className="pl-9"
                      value={form.adminDepartment}
                      onChange={(e) =>
                        handleChange("adminDepartment", e.target.value)
                      }
                      placeholder="Operations / HR"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPosition" className="text-sm font-medium">Job Title / Position (Optional)</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="adminPosition"
                    className="pl-9"
                    value={form.adminPosition}
                    onChange={(e) =>
                      handleChange("adminPosition", e.target.value)
                    }
                    placeholder="Chief Operating Officer"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex justify-end gap-3 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/owner/companies")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="min-w-[140px]">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Create Company"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

