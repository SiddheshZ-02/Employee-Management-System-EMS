import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload, X, Eye, Save } from "lucide-react";
import {
  getInvoiceTemplate,
  updateInvoiceTemplate,
  createInvoiceTemplate,
  uploadTemplateLogo,
  uploadTemplateSignature,
  type InvoiceTemplate,
} from "@/services/api/ownerApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DEFAULT_TEMPLATE: Partial<InvoiceTemplate> = {
  companyName: "",
  address: {
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  },
  phone: "",
  email: "",
  website: "",
  gstNumber: "",
  bankDetails: {
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolder: "",
    upiId: "",
  },
  paymentTerms: "Net 30",
  taxRate: 18,
  taxNumber: "",
  termsAndConditions: "Payment is due within the specified payment terms. Late payments may incur additional charges.",
  footerNotes: "Thank you for your business!",
  primaryColor: "#3b82f6",
  templateStyle: "modern",
};

export const InvoiceTemplateSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [template, setTemplate] = useState<Partial<InvoiceTemplate>>(DEFAULT_TEMPLATE);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await getInvoiceTemplate();
      if (response.success) {
        setTemplate(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching template:", error);
      // If no template exists, use default
      if (error.message?.includes("No invoice template found") || error.message?.includes("404")) {
        setTemplate(DEFAULT_TEMPLATE);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = template._id 
        ? await updateInvoiceTemplate(template)
        : await createInvoiceTemplate(template);

      if (response.success) {
        toast.success("Invoice template saved successfully");
        setTemplate(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2MB");
      return;
    }

    try {
      setUploadingLogo(true);
      const response = await uploadTemplateLogo(file);
      
      if (response.success) {
        setTemplate(prev => ({ ...prev, logo: response.data.url }));
        toast.success("Logo uploaded successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Signature must be less than 2MB");
      return;
    }

    try {
      setUploadingSignature(true);
      const response = await uploadTemplateSignature(file);
      
      if (response.success) {
        setTemplate(prev => ({ ...prev, signature: response.data.url }));
        toast.success("Signature uploaded successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload signature");
    } finally {
      setUploadingSignature(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setTemplate(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-background min-h-full text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Invoice Template</h1>
          <p className="text-sm text-muted-foreground">Customize your invoice design and branding</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Branding Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  {template.logo && (
                    <div className="relative w-24 h-24 border-2 border-border rounded-lg overflow-hidden">
                      <img src={template.logo} alt="Logo" className="w-full h-full object-contain" />
                      <button
                        onClick={() => updateField("logo", "")}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 2MB, PNG or JPG
                    </p>
                  </div>
                </div>
              </div>

              {/* Signature Upload */}
              <div className="space-y-2">
                <Label>Owner Signature</Label>
                <div className="flex items-center gap-4">
                  {template.signature && (
                    <div className="relative w-32 h-16 border-2 border-border rounded-lg overflow-hidden bg-white">
                      <img src={template.signature} alt="Signature" className="w-full h-full object-contain" />
                      <button
                        onClick={() => updateField("signature", "")}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      disabled={uploadingSignature}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 2MB, PNG with transparent background recommended
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary Color */}
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={template.primaryColor || "#3b82f6"}
                    onChange={(e) => updateField("primaryColor", e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={template.primaryColor || "#3b82f6"}
                    onChange={(e) => updateField("primaryColor", e.target.value)}
                    className="flex-1"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              {/* Template Style */}
              <div className="space-y-2">
                <Label>Template Style</Label>
                <select
                  value={template.templateStyle || "modern"}
                  onChange={(e) => updateField("templateStyle", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={template.companyName || ""}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input
                  value={template.address?.street || ""}
                  onChange={(e) => updateNestedField("address", "street", e.target.value)}
                  placeholder="123 Business Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={template.address?.city || ""}
                    onChange={(e) => updateNestedField("address", "city", e.target.value)}
                    placeholder="Mumbai"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={template.address?.state || ""}
                    onChange={(e) => updateNestedField("address", "state", e.target.value)}
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={template.address?.country || ""}
                    onChange={(e) => updateNestedField("address", "country", e.target.value)}
                    placeholder="India"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code</Label>
                  <Input
                    value={template.address?.zipCode || ""}
                    onChange={(e) => updateNestedField("address", "zipCode", e.target.value)}
                    placeholder="400001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={template.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={template.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="billing@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={template.website || ""}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="www.company.com"
                />
              </div>

              <div className="space-y-2">
                <Label>GST/Tax Number</Label>
                <Input
                  value={template.gstNumber || ""}
                  onChange={(e) => updateField("gstNumber", e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input
                  value={template.bankDetails?.bankName || ""}
                  onChange={(e) => updateNestedField("bankDetails", "bankName", e.target.value)}
                  placeholder="State Bank of India"
                />
              </div>

              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  value={template.bankDetails?.accountNumber || ""}
                  onChange={(e) => updateNestedField("bankDetails", "accountNumber", e.target.value)}
                  placeholder="1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label>IFSC Code</Label>
                <Input
                  value={template.bankDetails?.ifscCode || ""}
                  onChange={(e) => updateNestedField("bankDetails", "ifscCode", e.target.value)}
                  placeholder="SBIN0001234"
                />
              </div>

              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input
                  value={template.bankDetails?.accountHolder || ""}
                  onChange={(e) => updateNestedField("bankDetails", "accountHolder", e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label>UPI ID (Optional)</Label>
                <Input
                  value={template.bankDetails?.upiId || ""}
                  onChange={(e) => updateNestedField("bankDetails", "upiId", e.target.value)}
                  placeholder="company@upi"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Payment Terms & Tax</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <select
                  value={template.paymentTerms || "Net 30"}
                  onChange={(e) => updateField("paymentTerms", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="Net 15">Net 15 (Due in 15 days)</option>
                  <option value="Net 30">Net 30 (Due in 30 days)</option>
                  <option value="Net 60">Net 60 (Due in 60 days)</option>
                  <option value="Due on receipt">Due on Receipt</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={template.taxRate || 0}
                    onChange={(e) => updateField("taxRate", parseFloat(e.target.value) || 0)}
                    placeholder="18"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax Number</Label>
                  <Input
                    value={template.taxNumber || ""}
                    onChange={(e) => updateField("taxNumber", e.target.value)}
                    placeholder="GST Number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={template.termsAndConditions || ""}
                  onChange={(e) => updateField("termsAndConditions", e.target.value)}
                  placeholder="Payment terms and conditions..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Footer Notes</Label>
                <Textarea
                  value={template.footerNotes || ""}
                  onChange={(e) => updateField("footerNotes", e.target.value)}
                  placeholder="Thank you message or additional notes..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Live Preview */}
        <div className="space-y-6">
          <Card className="bg-card border-border sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <p className="text-sm text-muted-foreground">This is how your invoice will look</p>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                {/* Preview Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b-2" style={{ borderColor: template.primaryColor }}>
                  <div>
                    {template.logo ? (
                      <img src={template.logo} alt="Logo" className="h-16 object-contain mb-2" />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                        No Logo
                      </div>
                    )}
                    <h2 className="text-xl font-bold" style={{ color: template.primaryColor }}>
                      {template.companyName || "Your Company"}
                    </h2>
                  </div>
                  <div className="text-right">
                    <h1 className="text-3xl font-bold" style={{ color: template.primaryColor }}>
                      INVOICE
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">#{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}-0001</p>
                  </div>
                </div>

                {/* Preview From/To */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">From:</p>
                    <p className="text-sm font-semibold">{template.companyName || "Your Company"}</p>
                    <p className="text-xs text-gray-600">{template.address?.street}</p>
                    <p className="text-xs text-gray-600">{template.address?.city}, {template.address?.state}</p>
                    <p className="text-xs text-gray-600">GST: {template.gstNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Bill To:</p>
                    <p className="text-sm font-semibold">Client Company Name</p>
                    <p className="text-xs text-gray-600">client@company.com</p>
                    <p className="text-xs text-gray-600">+91 12345 67890</p>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-white" style={{ backgroundColor: template.primaryColor }}>
                        <th className="text-left p-2">Description</th>
                        <th className="text-center p-2">Qty</th>
                        <th className="text-right p-2">Price</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">Pro Plan - Annual Subscription</td>
                        <td className="p-2 text-center">1</td>
                        <td className="p-2 text-right">₹2,499</td>
                        <td className="p-2 text-right">₹2,499</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Preview Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-64">
                    <div className="flex justify-between py-1 text-sm">
                      <span>Subtotal:</span>
                      <span>₹2,499</span>
                    </div>
                    <div className="flex justify-between py-1 text-sm">
                      <span>Tax ({template.taxRate || 18}%):</span>
                      <span>₹450</span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold border-t-2 mt-2" style={{ borderColor: template.primaryColor, color: template.primaryColor }}>
                      <span>Total:</span>
                      <span>₹2,949</span>
                    </div>
                  </div>
                </div>

                {/* Preview Bank Details */}
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Payment Details:</p>
                  <p className="text-sm">{template.bankDetails?.bankName || "Bank Name"}</p>
                  <p className="text-sm">Account: {template.bankDetails?.accountNumber || "XXXXXX"}</p>
                  <p className="text-sm">IFSC: {template.bankDetails?.ifscCode || "XXXXXX"}</p>
                </div>

                {/* Preview Footer */}
                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-gray-600">{template.footerNotes || "Thank you for your business!"}</p>
                  {template.signature && (
                    <div className="mt-4 flex justify-end">
                      <img src={template.signature} alt="Signature" className="h-12 object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-8 rounded-lg">
            {/* Full preview content (same as live preview but larger) */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2" style={{ borderColor: template.primaryColor }}>
              <div>
                {template.logo && <img src={template.logo} alt="Logo" className="h-20 object-contain mb-2" />}
                <h2 className="text-2xl font-bold" style={{ color: template.primaryColor }}>
                  {template.companyName || "Your Company"}
                </h2>
                <p className="text-sm text-gray-600">{template.phone}</p>
                <p className="text-sm text-gray-600">{template.email}</p>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-bold" style={{ color: template.primaryColor }}>INVOICE</h1>
                <p className="text-sm text-gray-600 mt-2">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Due Date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="text-center py-12">
              <p className="text-gray-500">This is a preview. Download PDF to see the final invoice.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
