import { apiRequest } from "@/lib/api";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  companyId: { _id: string; name: string };
  raisedBy: { _id: string; name: string; email: string };
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  category: "billing" | "technical" | "account" | "feature-request" | "other";
  responses: Array<{
    from: { _id: string; name: string; email: string; role: string };
    message: string;
    timestamp: string;
  }>;
  resolvedAt?: string;
  resolutionNotes?: string;
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
// Support Ticket APIs
// ═══════════════════════════════════════════════════════════

export const createSupportTicket = async (data: {
  subject: string;
  description: string;
  priority?: "low" | "medium" | "high" | "critical";
  category?: "billing" | "technical" | "account" | "feature-request" | "other";
}): Promise<{ success: boolean; data: SupportTicket }> => {
  const token = getToken();
  return apiRequest("/api/admin/support/tickets", {
    method: "POST",
    token,
    body: data,
  });
};

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

  return apiRequest(`/api/admin/support/tickets?${queryParams.toString()}`, {
    method: "GET",
    token,
  });
};

export const getTicketById = async (
  ticketId: string
): Promise<{ success: boolean; data: SupportTicket }> => {
  const token = getToken();
  return apiRequest(`/api/admin/support/tickets/${ticketId}`, {
    method: "GET",
    token,
  });
};

export const addTicketResponse = async (
  ticketId: string,
  data: { message: string }
): Promise<{ success: boolean; data: SupportTicket }> => {
  const token = getToken();
  return apiRequest(`/api/admin/support/tickets/${ticketId}/response`, {
    method: "POST",
    token,
    body: data,
  });
};
