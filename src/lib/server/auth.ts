import { NextRequest } from 'next/server';
import { verifyToken, AuthUserPayload } from './jwt';
import { Role } from '@/types/database';


export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const getAuthUser = (req: NextRequest): AuthUserPayload => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access token required. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    return verifyToken(token);
  } catch (error) {
    throw new AppError('Invalid or expired authentication token.', 401);
  }
};

export const requireRole = (user: AuthUserPayload, allowedRoles: (Role | 'CLIENT' | 'FREELANCER' | 'ADMIN')[]): void => {
  if (!allowedRoles.map(String).includes(String(user.role))) {
    throw new AppError(
      `Access denied. Required role: [${allowedRoles.join(', ')}]. Your role: ${user.role}`,
      403
    );
  }
};

