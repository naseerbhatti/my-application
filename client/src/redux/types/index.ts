/**
 * Shared types for Redux store
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "librarian";
  avatar?: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
  permissions?: { [module: string]: ("READ" | "WRITE" | "UPDATE" | "DELETE")[] };
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface SlaughterStaff {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  phone: string;
  specialization?: string;
}

export interface UpdateStaffRequest extends Partial<CreateStaffRequest> {
  status?: "active" | "inactive";
}
