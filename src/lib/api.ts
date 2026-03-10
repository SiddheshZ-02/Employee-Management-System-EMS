import { API_BASE_URL } from "@/constant/Config";

export interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  token?: string | null;
  companyId?: string | null;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method, headers, body, token, companyId } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers || {}),
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (companyId) {
    requestHeaders["X-Company-Id"] = companyId;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: method || "GET",
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  return (await response.json()) as T;
}

