export type Role = 'USER' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: string;
  supabaseId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
  stripeCustomerId: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
