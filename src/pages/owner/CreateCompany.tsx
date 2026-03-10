import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

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
        title: "Company created",
        description: "Company and admin user have been created.",
      });
      navigate("/owner/companies");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to create company.";
      toast({
        title: "Failed to create company",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Company</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Acme Pvt Ltd"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain (optional)</Label>
                <Input
                  id="domain"
                  value={form.domain}
                  onChange={(e) => handleChange("domain", e.target.value)}
                  placeholder="acme.com"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name</Label>
                <Input
                  id="adminName"
                  value={form.adminName}
                  onChange={(e) => handleChange("adminName", e.target.value)}
                  placeholder="Admin Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) => handleChange("adminEmail", e.target.value)}
                  placeholder="admin@acme.com"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Admin Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={form.adminPassword}
                  onChange={(e) => handleChange("adminPassword", e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminDepartment">Admin Department</Label>
                <Input
                  id="adminDepartment"
                  value={form.adminDepartment}
                  onChange={(e) =>
                    handleChange("adminDepartment", e.target.value)
                  }
                  placeholder="Operations"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPosition">Admin Position</Label>
              <Input
                id="adminPosition"
                value={form.adminPosition}
                onChange={(e) =>
                  handleChange("adminPosition", e.target.value)
                }
                placeholder="HR Manager"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/owner/companies")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Company"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

