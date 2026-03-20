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

  if (response.status === 401) {
    // Attempt refresh if we have a refresh token
    const refreshToken = localStorage.getItem("ems_refreshToken") || localStorage.getItem("refreshToken");
    if (refreshToken && !path.includes("/auth/refresh") && !path.includes("/auth/login")) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.data.token) {
            const newToken = refreshData.data.token;
            const newRefreshToken = refreshData.data.refreshToken;
            
            // Store new tokens
            localStorage.setItem("ems_token", newToken);
            if (newRefreshToken) {
              localStorage.setItem("ems_refreshToken", newRefreshToken);
            }

            // Notify app about new token
            window.dispatchEvent(new CustomEvent("ems:tokenUpdated", { detail: newToken }));

            // Retry original request with new token
            requestHeaders.Authorization = `Bearer ${newToken}`;
            const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
              method: method || "GET",
              headers: requestHeaders,
              body: body !== undefined ? JSON.stringify(body) : undefined,
            });
            
            if (retryResponse.ok) {
              return (await retryResponse.json()) as T;
            }
          }
        }
      } catch (e) {
        console.error("Token refresh failed:", e);
      }
    }

    // If refresh fails or no refresh token, logout
    window.dispatchEvent(new CustomEvent("ems:sessionExpired"));
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.message || errorMessage;
    } catch (e) {
      errorMessage = (await response.text()) || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

