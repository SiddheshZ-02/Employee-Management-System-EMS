import { apiRequest } from "@/lib/api";
import { API_BASE_URL } from "@/constant/Config";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface DashboardAnalytics {
  summary: {
    totalCompanies: number;
    totalEmployees: number;
    monthlyRecurringRevenue: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    openTickets?: number;
  };
  revenueData: Array<{ month: string; revenue: number; new: number }>;
  planDistribution: Array<{ name: string; value: number; color: string }>;
  recentCompanies: Array<{
    id: string;
    name: string;
    employees: number;
    plan: string;
    status: string;
  }>;
  recentActivity: Array<{
    type: string;
    text: string;
    time: string;
    priority?: string;
    status?: string;
    ticketId?: string;
  }>;
}

export interface Company {
  _id: string;
  name: string;
  domain?: string;
  industry?: string;
  status: string;
  subscription?: {
    plan: string;
    status: string;
    startDate: string;
    renewalDate: string;
    amount: number;
    currency: string;
    employeeCount: number;
    maxEmployees: number;
  };
  admin?: { name: string; email: string } | null;
  employeeCount?: number;
  createdAt: string;
}

export interface CompanyDetails extends Company {
  adminName: string;
  email: string;
  daysLeft: number;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  isActive: boolean;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  companyId: { _id: string; name: string; email?: string; phone?: string };
  amount: number;
  plan: string;
  status: string;
  createdAt: string;
  dueDate?: string;
}

export interface Plan {
  _id?: string;
  name: string;
  key: string;
  price: number;
  maxEmployees: number;
  maxAdmins: number;
  features: string[];
  isActive: boolean;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  companyId: { _id: string; name: string };
  raisedBy: { name: string; email: string };
  subject: string;
  description: string;
  priority: string;
  status: string;
  category?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceTemplate {
  _id?: string;
  ownerId: string;
  logo?: string;
  signature?: string;
  companyName: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  website: string;
  gstNumber: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
    upiId?: string;
  };
  paymentTerms: 'Net 15' | 'Net 30' | 'Net 60' | 'Due on receipt';
  taxRate: number;
  taxNumber: string;
  termsAndConditions: string;
  footerNotes: string;
  primaryColor: string;
  templateStyle: 'modern' | 'classic' | 'minimal';
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceDetails extends Invoice {
  companyId: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
  };
  ownerId: string;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'overdue';
  period: {
    startDate: string;
    endDate: string;
  };
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  description: string;
  items: InvoiceItem[];
  subtotal?: number;
  taxAmount?: number;
  taxRate?: number;
  discountAmount?: number;
  template?: InvoiceTemplate;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// ═══════════════════════════════════════════════════════════
// Helper: Get token from localStorage
// ═══════════════════════════════════════════════════════════

const getToken = (): string | null => {
  return localStorage.getItem("ems_token") || localStorage.getItem("token");
};

// ═══════════════════════════════════════════════════════════
// Dashboard APIs
// ═══════════════════════════════════════════════════════════

export const getDashboardAnalytics = async (): Promise<{
  success: boolean;
  data: DashboardAnalytics;
}> => {
  const token = getToken();
  return apiRequest("/api/owner/dashboard-analytics", {
    method: "GET",
    token,
  });
};

// ═══════════════════════════════════════════════════════════
// Company APIs
// ═══════════════════════════════════════════════════════════

export const getCompanies = async (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    plan?: string;
  } = {}
): Promise<{
  success: boolean;
  data: { companies: Company[]; pagination: Pagination };
}> => {
  const token = getToken();
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.status) queryParams.set("status", params.status);
  if (params.search) queryParams.set("search", params.search);
  if (params.plan) queryParams.set("plan", params.plan);

  return apiRequest(`/api/owner/companies?${queryParams.toString()}`, {
    method: "GET",
    token,
  });
};

export const getCompanyById = async (
  id: string
): Promise<{ success: boolean; data: CompanyDetails }> => {
  const token = getToken();
  return apiRequest(`/api/owner/companies/${id}`, {
    method: "GET",
    token,
  });
};

export const createCompany = async (data: {
  companyName: string;
  domain?: string;
  industry?: string;
  registrationDate: string;
  status: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  plan?: string;
}): Promise<{
  success: boolean;
  data: { company: Company; admin: Admin; invoice?: any };
}> => {
  const token = getToken();
  return apiRequest("/api/owner/companies", {
    method: "POST",
    token,
    body: data,
  });
};

export const updateCompany = async (
  id: string,
  data: Partial<Company>
): Promise<{ success: boolean; data: Company }> => {
  const token = getToken();
  return apiRequest(`/api/owner/companies/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
};

export const deleteCompany = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const token = getToken();
  return apiRequest(`/api/owner/companies/${id}`, {
    method: "DELETE",
    token,
  });
};

export const updateCompanySubscription = async (
  id: string,
  data: { plan: string; employeeCount: number }
): Promise<{ success: boolean; data: { company: Company; invoice: any } }> => {
  const token = getToken();
  return apiRequest(`/api/owner/companies/${id}/subscription`, {
    method: "PUT",
    token,
    body: data,
  });
};

// ═══════════════════════════════════════════════════════════
// Admin APIs
// ═══════════════════════════════════════════════════════════

export const getCompanyAdmins = async (
  companyId: string
): Promise<{
  success: boolean;
  data: { company: { _id: string; name: string; domain?: string }; admins: Admin[] };
}> => {
  const token = getToken();
  return apiRequest(`/api/owner/companies/${companyId}/admins`, {
    method: "GET",
    token,
  });
};

export const addCompanyAdmin = async (
  companyId: string,
  data: {
    name: string;
    email: string;
    password: string;
    department?: string;
    position?: string;
  }
): Promise<{ success: boolean; data: Admin }> => {
  const token = getToken();
  return apiRequest(`/api/owner/companies/${companyId}/admins`, {
    method: "POST",
    token,
    body: data,
  });
};

export const updateAdmin = async (
  companyId: string,
  adminId: string,
  data: Partial<Admin>
): Promise<{ success: boolean; data: Admin }> => {
  const token = getToken();
  return apiRequest(`/api/owner/companies/${companyId}/admins/${adminId}`, {
    method: "PUT",
    token,
    body: data,
  });
};

export const deleteAdmin = async (
  companyId: string,
  adminId: string
): Promise<{ success: boolean; message: string }> => {
  const token = getToken();
  return apiRequest(`/api/owner/companies/${companyId}/admins/${adminId}`, {
    method: "DELETE",
    token,
  });
};

// ═══════════════════════════════════════════════════════════
// Billing APIs
// ═══════════════════════════════════════════════════════════

export const getInvoices = async (
  params: { page?: number; limit?: number; status?: string } = {}
): Promise<{
  success: boolean;
  data: { invoices: Invoice[]; pagination: Pagination };
}> => {
  const token = getToken();
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.status) queryParams.set("status", params.status);

  return apiRequest(`/api/owner/billing/invoices?${queryParams.toString()}`, {
    method: "GET",
    token,
  });
};

export const getRevenueAnalytics = async (): Promise<{
  success: boolean;
  data: {
    mrr: number;
    arr: number;
    pendingAmount: number;
    churnRate: number;
    revenueData: Array<{ month: string; revenue: number; new: number }>;
    totalCompanies: number;
    activeCompanies: number;
  };
}> => {
  const token = getToken();
  return apiRequest("/api/owner/billing/revenue-analytics", {
    method: "GET",
    token,
  });
};

export const retryPayment = async (
  invoiceId: string
): Promise<{ success: boolean; data: Invoice }> => {
  const token = getToken();
  return apiRequest(`/api/owner/billing/invoices/${invoiceId}/retry`, {
    method: "POST",
    token,
  });
};

export const downloadInvoicePDF = async (
  invoiceId: string
): Promise<void> => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/api/owner/billing/invoices/${invoiceId}/download`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download invoice");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${invoiceId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// ═══════════════════════════════════════════════════════════
// Invoice Template APIs
// ═══════════════════════════════════════════════════════════

export const getInvoiceTemplate = async (): Promise<{
  success: boolean;
  data: InvoiceTemplate;
}> => {
  const token = getToken();
  return apiRequest('/api/owner/invoice-template', {
    method: 'GET',
    token,
  });
};

export const createInvoiceTemplate = async (data: Partial<InvoiceTemplate>): Promise<{
  success: boolean;
  data: InvoiceTemplate;
}> => {
  const token = getToken();
  return apiRequest('/api/owner/invoice-template', {
    method: 'POST',
    token,
    body: data,
  });
};

export const updateInvoiceTemplate = async (data: Partial<InvoiceTemplate>): Promise<{
  success: boolean;
  data: InvoiceTemplate;
}> => {
  const token = getToken();
  return apiRequest('/api/owner/invoice-template', {
    method: 'PUT',
    token,
    body: data,
  });
};

export const uploadTemplateLogo = async (file: File): Promise<{
  success: boolean;
  data: { url: string };
}> => {
  const token = getToken();
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch(`${API_BASE_URL}/api/owner/invoice-template/upload-logo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};

export const uploadTemplateSignature = async (file: File): Promise<{
  success: boolean;
  data: { url: string };
}> => {
  const token = getToken();
  const formData = new FormData();
  formData.append('signature', file);

  const response = await fetch(`${API_BASE_URL}/api/owner/invoice-template/upload-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};

export const previewInvoice = async (invoiceId: string): Promise<{
  success: boolean;
  data: InvoiceDetails;
}> => {
  const token = getToken();
  return apiRequest(`/api/owner/billing/invoices/${invoiceId}/preview`, {
    method: 'GET',
    token,
  });
};

export const getInvoiceDetails = async (invoiceId: string): Promise<{
  success: boolean;
  data: InvoiceDetails;
}> => {
  const token = getToken();
  return apiRequest(`/api/owner/billing/invoices/${invoiceId}`, {
    method: 'GET',
    token,
  });
};

// ═══════════════════════════════════════════════════════════
// Plan APIs
// ═══════════════════════════════════════════════════════════

export const getPlans = async (): Promise<{
  success: boolean;
  data: Plan[];
}> => {
  const token = getToken();
  return apiRequest("/api/owner/plans", {
    method: "GET",
    token,
  });
};

export const getPlanAnalytics = async (): Promise<{
  success: boolean;
  data: Array<{ plan: string; revenue: number; companies: number }>;
}> => {
  const token = getToken();
  return apiRequest("/api/owner/plans/analytics", {
    method: "GET",
    token,
  });
};

export const createPlan = async (data: {
  name: string;
  key: string;
  price: number;
  maxEmployees: number;
  maxAdmins?: number;
  features?: string[];
  description?: string;
  billingCycle?: 'monthly' | 'yearly';
  sortOrder?: number;
}): Promise<{ success: boolean; data: Plan }> => {
  const token = getToken();
  return apiRequest("/api/owner/plans", {
    method: "POST",
    token,
    body: data,
  });
};

export const updatePlan = async (
  id: string,
  data: Partial<Plan>
): Promise<{ success: boolean; data: Plan }> => {
  const token = getToken();
  return apiRequest(`/api/owner/plans/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
};

export const deletePlan = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const token = getToken();
  return apiRequest(`/api/owner/plans/${id}`, {
    method: "DELETE",
    token,
  });
};

export const getPlanById = async (
  id: string
): Promise<{ success: boolean; data: Plan & { companiesCount: number } }> => {
  const token = getToken();
  return apiRequest(`/api/owner/plans/${id}`, {
    method: "GET",
    token,
  });
};

// ═══════════════════════════════════════════════════════════
// Support APIs
// ═══════════════════════════════════════════════════════════

export const getSupportTickets = async (
  params: { page?: number; limit?: number; status?: string } = {}
): Promise<{
  success: boolean;
  data: { tickets: SupportTicket[]; pagination: Pagination };
}> => {
  const token = getToken();
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.status) queryParams.set("status", params.status);

  return apiRequest(`/api/owner/support/tickets?${queryParams.toString()}`, {
    method: "GET",
    token,
  });
};

export const updateSupportTicket = async (
  ticketId: string,
  data: { status: string; resolutionNotes?: string }
): Promise<{ success: boolean; data: SupportTicket }> => {
  const token = getToken();
  return apiRequest(`/api/owner/support/tickets/${ticketId}`, {
    method: "PUT",
    token,
    body: data,
  });
};

export const getSupportAnalytics = async (): Promise<{
  success: boolean;
  data: {
    openTickets: number;
    resolvedToday: number;
    avgResponseTime: string;
  };
}> => {
  const token = getToken();
  return apiRequest("/api/owner/support/analytics", {
    method: "GET",
    token,
  });
};

// ═══════════════════════════════════════════════════════════
// Settings & Profile APIs
// ═══════════════════════════════════════════════════════════

export const getOwnerProfile = async (): Promise<{
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
  };
}> => {
  const token = getToken();
  return apiRequest("/api/owner/profile", {
    method: "GET",
    token,
  });
};

export const updateOwnerProfile = async (data: {
  name?: string;
  email?: string;
  phone?: string;
}): Promise<{
  success: boolean;
  data: { _id: string; name: string; email: string; phone?: string; role: string };
}> => {
  const token = getToken();
  return apiRequest("/api/owner/profile", {
    method: "PUT",
    token,
    body: data,
  });
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  const token = getToken();
  return apiRequest("/api/owner/profile/password", {
    method: "PUT",
    token,
    body: data,
  });
};

export const getSettings = async (): Promise<{
  success: boolean;
  data: {
    platform: {
      name: string;
      domain?: string;
      supportEmail?: string;
      logo?: string;
    };
    notifications: {
      newCompanySignup: boolean;
      paymentReceived: boolean;
      planExpiryAlerts: boolean;
      supportTicketOpened: boolean;
      platformErrorAlerts: boolean;
    };
    security: {
      twoFactorEnabled: boolean;
      sessionTimeout: number;
    };
  };
}> => {
  const token = getToken();
  return apiRequest("/api/owner/settings", {
    method: "GET",
    token,
  });
};

export const updateSettings = async (data: {
  platform?: any;
  notifications?: any;
  security?: any;
}): Promise<{ success: boolean; data: any }> => {
  const token = getToken();
  return apiRequest("/api/owner/settings", {
    method: "PUT",
    token,
    body: data,
  });
};
