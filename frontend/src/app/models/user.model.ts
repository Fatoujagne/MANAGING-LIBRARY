export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'Admin' | 'Member';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
