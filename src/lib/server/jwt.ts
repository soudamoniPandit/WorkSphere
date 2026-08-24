import jwt from 'jsonwebtoken';
import { env } from './env';
import { Role } from '@/types/database';


export interface AuthUserPayload {
  userId: string;
  email: string;
  role: Role;
}

export const generateToken = (payload: AuthUserPayload): string => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    }
  );
};

export const verifyToken = (token: string): AuthUserPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & AuthUserPayload;
  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };
};
