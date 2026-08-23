import { prisma } from '../../prisma';
import { hashPassword, comparePassword } from '../password';
import { generateToken } from '../jwt';
import { AppError } from '../auth';
import { Role } from '@prisma/client';

export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  static async register(dto: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists.', 400);
    }

    const hashedPassword = await hashPassword(dto.password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          fullName: dto.fullName,
          role: dto.role,
        },
      });

      if (dto.role === Role.CLIENT) {
        await tx.clientProfile.create({
          data: { userId: user.id },
        });
      } else if (dto.role === Role.FREELANCER) {
        await tx.freelancerProfile.create({
          data: { userId: user.id },
        });
      }

      return user;
    });

    const token = generateToken({
      userId: result.id,
      email: result.email,
      role: result.role,
    });

    const { password, ...sanitizedUser } = result;

    return {
      user: sanitizedUser,
      token,
    };
  }

  static async login(dto: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isPasswordValid = await comparePassword(dto.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password, ...sanitizedUser } = user;

    return {
      user: sanitizedUser,
      token,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        clientProfile: true,
        freelancerProfile: {
          include: {
            skills: { include: { skill: true } },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User account not found.', 404);
    }

    return user;
  }
}
