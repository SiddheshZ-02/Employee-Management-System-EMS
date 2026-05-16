export type UserRole = "Owner" | "Admin" | "Employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  timezone?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  profilePicture?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  timezone: string;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  sessionExpiry: number | null;
  sessionExpired: boolean;
}
