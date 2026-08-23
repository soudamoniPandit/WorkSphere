import { prisma } from '../../prisma';
import { AppError } from '../auth';

export interface UpdateClientProfileDTO {
  fullName?: string;
  avatarUrl?: string;
  companyName?: string;
  companyWebsite?: string;
  description?: string;
  location?: string;
}

export interface UpdateFreelancerProfileDTO {
  fullName?: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  hourlyRate?: number;
  location?: string;
  experienceYears?: number;
  skills?: string[];
}

export interface AddPortfolioItemDTO {
  title: string;
  description: string;
  projectUrl?: string;
  imageUrl?: string;
}

export class ProfileService {
  static async getProfile(userId: string) {
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
            portfolioProjects: { orderBy: { createdAt: 'desc' } },
            proposals: {
              where: { status: 'ACCEPTED' },
              include: {
                project: {
                  include: {
                    client: {
                      include: {
                        user: { select: { id: true, fullName: true, avatarUrl: true } },
                      },
                    },
                    reviews: true,
                  },
                },
              },
              orderBy: { updatedAt: 'desc' },
            },
          },
        },
        reviewsReceived: {
          include: {
            reviewer: { select: { id: true, fullName: true, avatarUrl: true } },
            project: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new AppError('User profile not found', 404);
    }

    return user;
  }

  static async updateClientProfile(userId: string, dto: UpdateClientProfileDTO) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true },
    });

    if (!user || !user.clientProfile) {
      throw new AppError('Client profile not found', 404);
    }

    return await prisma.$transaction(async (tx) => {
      if (dto.fullName || dto.avatarUrl) {
        await tx.user.update({
          where: { id: userId },
          data: {
            ...(dto.fullName && { fullName: dto.fullName }),
            ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
          },
        });
      }

      const updatedProfile = await tx.clientProfile.update({
        where: { userId },
        data: {
          ...(dto.companyName !== undefined && { companyName: dto.companyName }),
          ...(dto.companyWebsite !== undefined && { companyWebsite: dto.companyWebsite }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.location !== undefined && { location: dto.location }),
        },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, avatarUrl: true, role: true },
          },
        },
      });

      return updatedProfile;
    });
  }

  static async updateFreelancerProfile(userId: string, dto: UpdateFreelancerProfileDTO) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { freelancerProfile: true },
    });

    if (!user || !user.freelancerProfile) {
      throw new AppError('Freelancer profile not found', 404);
    }

    const freelancerProfileId = user.freelancerProfile.id;

    return await prisma.$transaction(async (tx) => {
      if (dto.fullName || dto.avatarUrl) {
        await tx.user.update({
          where: { id: userId },
          data: {
            ...(dto.fullName && { fullName: dto.fullName }),
            ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
          },
        });
      }

      await tx.freelancerProfile.update({
        where: { id: freelancerProfileId },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.bio !== undefined && { bio: dto.bio }),
          ...(dto.hourlyRate !== undefined && { hourlyRate: dto.hourlyRate }),
          ...(dto.location !== undefined && { location: dto.location }),
          ...(dto.experienceYears !== undefined && { experienceYears: dto.experienceYears }),
        },
      });

      if (dto.skills && Array.isArray(dto.skills)) {
        await tx.freelancerSkill.deleteMany({
          where: { freelancerId: freelancerProfileId },
        });

        for (const skillName of dto.skills) {
          const trimmedName = skillName.trim();
          if (!trimmedName) continue;

          const skill = await tx.skill.upsert({
            where: { name: trimmedName },
            update: {},
            create: { name: trimmedName },
          });

          await tx.freelancerSkill.create({
            data: {
              freelancerId: freelancerProfileId,
              skillId: skill.id,
            },
          });
        }
      }

      return await tx.freelancerProfile.findUnique({
        where: { id: freelancerProfileId },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, avatarUrl: true, role: true },
          },
          skills: { include: { skill: true } },
          portfolioProjects: true,
        },
      });
    });
  }

  static async addPortfolioItem(userId: string, dto: AddPortfolioItemDTO) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { freelancerProfile: true },
    });

    if (!user || !user.freelancerProfile) {
      throw new AppError('Freelancer profile not found', 404);
    }

    return await prisma.portfolioItem.create({
      data: {
        freelancerId: user.freelancerProfile.id,
        title: dto.title,
        description: dto.description,
        projectUrl: dto.projectUrl,
        imageUrl: dto.imageUrl,
      },
    });
  }

  static async deletePortfolioItem(userId: string, itemId: string) {
    const item = await prisma.portfolioItem.findUnique({
      where: { id: itemId },
      include: { freelancer: true },
    });

    if (!item) {
      throw new AppError('Portfolio item not found', 404);
    }

    if (item.freelancer.userId !== userId) {
      throw new AppError('Unauthorized to delete this portfolio item', 403);
    }

    await prisma.portfolioItem.delete({
      where: { id: itemId },
    });

    return { message: 'Portfolio item deleted successfully' };
  }

  static async listFreelancers(query: { skill?: string; search?: string }) {
    const whereClause: any = {};

    if (query.skill) {
      whereClause.skills = {
        some: {
          skill: { name: { contains: query.skill, mode: 'insensitive' } },
        },
      };
    }

    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { bio: { contains: query.search, mode: 'insensitive' } },
        { user: { fullName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return await prisma.freelancerProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, email: true, fullName: true, avatarUrl: true } },
        skills: { include: { skill: true } },
        portfolioProjects: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
