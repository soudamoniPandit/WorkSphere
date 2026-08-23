import { prisma } from '../../prisma';
import { AppError } from '../auth';
import { ProjectStatus, Role, ProposalStatus } from '@prisma/client';

export interface CreateProjectDTO {
  title: string;
  description: string;
  budget: number;
  deadline?: string;
  skills: string[]; // e.g. ["React", "Node.js", "PostgreSQL"]
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  budget?: number;
  deadline?: string;
  status?: ProjectStatus;
  skills?: string[];
}

export interface GetProjectsQuery {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  skill?: string;
  search?: string;
  minBudget?: number;
  maxBudget?: number;
}

export class ProjectService {
  static async createProject(userId: string, dto: CreateProjectDTO) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true },
    });

    if (!user || !user.clientProfile) {
      throw new AppError('Client profile not found. Only clients can create projects.', 404);
    }

    const clientId = user.clientProfile.id;

    return await prisma.$transaction(async (tx) => {
      // 1. Create Project record
      const project = await tx.project.create({
        data: {
          clientId,
          title: dto.title,
          description: dto.description,
          budget: dto.budget,
          deadline: dto.deadline ? new Date(dto.deadline) : null,
          status: ProjectStatus.OPEN,
        },
      });

      // 2. Link Skills taxonomy
      if (dto.skills && dto.skills.length > 0) {
        for (const skillName of dto.skills) {
          const trimmed = skillName.trim();
          if (!trimmed) continue;

          const skill = await tx.skill.upsert({
            where: { name: trimmed },
            update: {},
            create: { name: trimmed },
          });

          await tx.projectSkill.create({
            data: {
              projectId: project.id,
              skillId: skill.id,
            },
          });
        }
      }

      // 3. Return full project with skills & client metadata
      return await tx.project.findUnique({
        where: { id: project.id },
        include: {
          client: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true, avatarUrl: true },
              },
            },
          },
          skills: { include: { skill: true } },
        },
      });
    });
  }

  static async getProjects(query: GetProjectsQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Filter by Status (Defaults to OPEN projects if not specified)
    if (query.status) {
      whereClause.status = query.status;
    } else {
      whereClause.status = ProjectStatus.OPEN;
    }

    // Filter by Skill
    if (query.skill) {
      whereClause.skills = {
        some: {
          skill: {
            name: { contains: query.skill, mode: 'insensitive' },
          },
        },
      };
    }

    // Filter by Budget Range
    if (query.minBudget !== undefined || query.maxBudget !== undefined) {
      whereClause.budget = {};
      if (query.minBudget !== undefined) whereClause.budget.gte = query.minBudget;
      if (query.maxBudget !== undefined) whereClause.budget.lte = query.maxBudget;
    }

    // Search by Title or Description
    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Execute count and query concurrently
    const [total, projects] = await Promise.all([
      prisma.project.count({ where: whereClause }),
      prisma.project.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            include: {
              user: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
            },
          },
          skills: { include: { skill: true } },
          _count: {
            select: { proposals: true, milestones: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getProjectById(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, avatarUrl: true },
            },
          },
        },
        skills: { include: { skill: true } },
        milestones: { orderBy: { createdAt: 'asc' } },
        _count: {
          select: { proposals: true },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return project;
  }

  static async updateProject(userId: string, projectId: string, dto: UpdateProjectDTO) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.client.userId !== userId) {
      throw new AppError('Unauthorized to modify this project', 403);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: projectId },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.budget !== undefined && { budget: dto.budget }),
          ...(dto.deadline !== undefined && { deadline: dto.deadline ? new Date(dto.deadline) : null }),
          ...(dto.status !== undefined && { status: dto.status }),
        },
      });

      if (dto.skills && Array.isArray(dto.skills)) {
        await tx.projectSkill.deleteMany({ where: { projectId } });

        for (const skillName of dto.skills) {
          const trimmed = skillName.trim();
          if (!trimmed) continue;

          const skill = await tx.skill.upsert({
            where: { name: trimmed },
            update: {},
            create: { name: trimmed },
          });

          await tx.projectSkill.create({
            data: { projectId, skillId: skill.id },
          });
        }
      }

      return await tx.project.findUnique({
        where: { id: projectId },
        include: {
          client: {
            include: { user: { select: { id: true, fullName: true, email: true } } },
          },
          skills: { include: { skill: true } },
        },
      });
    });
  }

  static async deleteProject(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.client.userId !== userId) {
      throw new AppError('Unauthorized to delete this project', 403);
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Project deleted successfully' };
  }

  static async getClientProjects(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true },
    });

    if (!user || !user.clientProfile) {
      throw new AppError('Client profile not found', 404);
    }

    return await prisma.project.findMany({
      where: { clientId: user.clientProfile.id },
      include: {
        skills: { include: { skill: true } },
        proposals: {
          select: {
            id: true,
            status: true,
            proposedPrice: true,
            estimatedDays: true,
            createdAt: true,
            freelancer: {
              select: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
              },
            },
          },
        },
        _count: {
          select: { proposals: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getDashboardStats(userId: string, role: Role) {
    if (role === Role.CLIENT) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { clientProfile: true },
      });

      if (!user || !user.clientProfile) {
        throw new AppError('Client profile not found', 404);
      }

      const clientId = user.clientProfile.id;

      const [totalProjects, openProjects, activeProjects, completedProjects, allProjects] =
        await Promise.all([
          prisma.project.count({ where: { clientId } }),
          prisma.project.count({ where: { clientId, status: ProjectStatus.OPEN } }),
          prisma.project.count({ where: { clientId, status: ProjectStatus.IN_PROGRESS } }),
          prisma.project.count({ where: { clientId, status: ProjectStatus.COMPLETED } }),
          prisma.project.findMany({
            where: { clientId },
            include: {
              skills: { include: { skill: true } },
              _count: { select: { proposals: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
        ]);

      const [totalProposals, shortlistedProposals, recentProposals] = await Promise.all([
        prisma.proposal.count({
          where: { project: { clientId } },
        }),
        prisma.proposal.count({
          where: { project: { clientId }, status: ProposalStatus.SHORTLISTED },
        }),
        prisma.proposal.findMany({
          where: { project: { clientId } },
          include: {
            project: { select: { id: true, title: true, status: true, budget: true } },
            freelancer: {
              include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
                skills: { include: { skill: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      return {
        role: Role.CLIENT,
        user: { fullName: user.fullName, email: user.email },
        metrics: {
          totalProjects,
          openProjects,
          activeProjects,
          completedProjects,
          totalProposals,
          shortlistedProposals,
        },
        recentProjects: allProjects,
        recentProposals,
      };
    } else if (role === Role.FREELANCER) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          freelancerProfile: {
            include: {
              skills: { include: { skill: true } },
              portfolioProjects: true,
            },
          },
        },
      });

      if (!user || !user.freelancerProfile) {
        throw new AppError('Freelancer profile not found', 404);
      }

      const freelancerId = user.freelancerProfile.id;

      const [
        availableProjectsCount,
        myProposalsCount,
        pendingProposalsCount,
        shortlistedProposalsCount,
        acceptedProposalsCount,
        recentProposals,
        availableProjects,
      ] = await Promise.all([
        prisma.project.count({ where: { status: ProjectStatus.OPEN } }),
        prisma.proposal.count({ where: { freelancerId } }),
        prisma.proposal.count({ where: { freelancerId, status: ProposalStatus.PENDING } }),
        prisma.proposal.count({ where: { freelancerId, status: ProposalStatus.SHORTLISTED } }),
        prisma.proposal.count({ where: { freelancerId, status: ProposalStatus.ACCEPTED } }),
        prisma.proposal.findMany({
          where: { freelancerId },
          include: {
            project: {
              include: {
                client: {
                  include: {
                    user: { select: { id: true, fullName: true, avatarUrl: true } },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.project.findMany({
          where: { status: ProjectStatus.OPEN },
          include: {
            client: {
              include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
              },
            },
            skills: { include: { skill: true } },
            _count: { select: { proposals: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      return {
        role: Role.FREELANCER,
        user: {
          fullName: user.fullName,
          email: user.email,
          profileComplete: !!(
            user.freelancerProfile.title &&
            user.freelancerProfile.skills.length > 0
          ),
        },
        metrics: {
          availableProjects: availableProjectsCount,
          myProposals: myProposalsCount,
          pendingProposals: pendingProposalsCount,
          shortlistedProposals: shortlistedProposalsCount,
          acceptedProposals: acceptedProposalsCount,
        },
        recentProposals,
        availableProjects,
      };
    }

    throw new AppError('Invalid role for dashboard', 400);
  }
}
