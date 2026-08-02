import { apiRequest } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { API_BASE_URL } from "@/constants/config";
import type { User, UserRole } from "@/features/auth/types";

interface LoginResponse {
  success: boolean;
  data: {
    _id: string;
    email: string;
    name: string;
    role: string;
    companyId?: string;
    department?: string;
    phone?: string;
    token: string;
    refreshToken?: string;
  };
}

export function mapApiUserToUser(apiUser: LoginResponse["data"]): User {
  let mappedRole: UserRole = "Employee";
  if (apiUser.role === "owner") mappedRole = "Owner";
  else if (apiUser.role === "admin" || apiUser.role === "manager")
    mappedRole = "Admin";

  return {
    id: apiUser._id,
    email: apiUser.email,
    name: apiUser.name,
    role: mappedRole,
    companyId: apiUser.companyId,
    department: apiUser.department,
    phone: apiUser.phone,
  };
}

export async function loginRequest(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.login}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Wrong email or password");
    }
    const errorMessage = body?.message || "Server error. Please try again later.";
    throw new Error(errorMessage);
  }

  if (!body?.success || !body?.data) {
    throw new Error("Unable to log in. Please try again.");
  }

  return body.data;
}

export async function logoutRequest(token: string) {
  await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.logout}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => undefined);
}

export async function forgotPasswordRequest(email: string) {
  return apiRequest(API_ENDPOINTS.auth.forgotPassword, {
    method: "POST",
    body: { email },
  });
}

export async function resetPasswordRequest(token: string, newPassword: string) {
  return apiRequest(API_ENDPOINTS.auth.resetPassword, {
    method: "POST",
    body: { token, newPassword },
  });
}
