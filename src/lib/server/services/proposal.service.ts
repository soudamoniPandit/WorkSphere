import { prisma } from '../../prisma';
import { AppError } from '../auth';
import { Role, ProposalStatus, ProjectStatus } from '@prisma/client';

export interface SubmitProposalDTO {
  coverLetter: string;
  proposedPrice: number;
  estimatedDays: number;
}

export class ProposalService {
  static async submitProposal(userId: string, projectId: string, dto: SubmitProposalDTO) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { freelancerProfile: true },
    });

    if (!user || !user.freelancerProfile) {
      throw new AppError('Freelancer profile not found. Only freelancers can submit proposals.', 403);
    }

    const freelancerProfileId = user.freelancerProfile.id;

    // Check project status
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    if (project.status !== ProjectStatus.OPEN) {
      throw new AppError('Proposals can only be submitted to OPEN projects.', 400);
    }

    if (project.client.userId === userId) {
      throw new AppError('You cannot submit a proposal to your own project.', 400);
    }

    // Check if already submitted
    const existingProposal = await prisma.proposal.findUnique({
      where: {
        projectId_freelancerId: {
          projectId,
          freelancerId: freelancerProfileId,
        },
      },
    });

    if (existingProposal) {
      throw new AppError('You have already submitted a proposal for this project.', 400);
    }

    return await prisma.proposal.create({
      data: {
        projectId,
        freelancerId: freelancerProfileId,
        coverLetter: dto.coverLetter,
        proposedPrice: dto.proposedPrice,
        estimatedDays: dto.estimatedDays,
        status: ProposalStatus.PENDING,
      },
      include: {
        project: {
          include: {
            client: {
              include: {
                user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
              },
            },
          },
        },
        freelancer: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
            skills: { include: { skill: true } },
          },
        },
      },
    });
  }

  static async getProposalsForProject(userId: string, userRole: Role, projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    if (userRole === Role.CLIENT) {
      if (project.client.userId !== userId) {
        throw new AppError('Unauthorized: You can only view proposals for your own projects.', 403);
      }

      return await prisma.proposal.findMany({
        where: { projectId },
        include: {
          freelancer: {
            include: {
              user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
              skills: { include: { skill: true } },
              portfolioProjects: { orderBy: { createdAt: 'desc' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (userRole === Role.FREELANCER) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { freelancerProfile: true },
      });

      if (!user?.freelancerProfile) {
        return [];
      }

      return await prisma.proposal.findMany({
        where: {
          projectId,
          freelancerId: user.freelancerProfile.id,
        },
        include: {
          freelancer: {
            include: {
              user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
              skills: { include: { skill: true } },
            },
          },
        },
      });
    } else if (userRole === Role.ADMIN) {
      return await prisma.proposal.findMany({
        where: { projectId },
        include: {
          freelancer: {
            include: {
              user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
              skills: { include: { skill: true } },
              portfolioProjects: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new AppError('Access denied.', 403);
  }

  static async getMyProposals(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { freelancerProfile: true },
    });

    if (!user || !user.freelancerProfile) {
      throw new AppError('Freelancer profile not found.', 404);
    }

    return await prisma.proposal.findMany({
      where: { freelancerId: user.freelancerProfile.id },
      include: {
        project: {
          include: {
            client: {
              include: {
                user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
              },
            },
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getProposalById(userId: string, userRole: Role, proposalId: string) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        project: {
          include: {
            client: {
              include: {
                user: { select: { id: true, fullName: true, email: true } },
              },
            },
            skills: { include: { skill: true } },
          },
        },
        freelancer: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
            skills: { include: { skill: true } },
            portfolioProjects: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    if (!proposal) {
      throw new AppError('Proposal not found.', 404);
    }

    if (userRole === Role.CLIENT && proposal.project.client.userId !== userId) {
      throw new AppError('Unauthorized to view this proposal.', 403);
    }

    if (userRole === Role.FREELANCER && proposal.freelancer.userId !== userId) {
      throw new AppError('Unauthorized to view this proposal.', 403);
    }

    return proposal;
  }

  static async updateProposalStatus(userId: string, proposalId: string, newStatus: ProposalStatus) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        freelancer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new AppError('Proposal not found.', 404);
    }

    if (proposal.project.client.userId !== userId) {
      throw new AppError('Unauthorized: Only the project owner client can update proposal status.', 403);
    }

    if (newStatus === ProposalStatus.ACCEPTED) {
      return await prisma.$transaction(async (tx) => {
        // 1. Update this proposal status to ACCEPTED
        const acceptedProposal = await tx.proposal.update({
          where: { id: proposalId },
          data: { status: ProposalStatus.ACCEPTED },
          include: {
            freelancer: {
              include: {
                user: { select: { id: true, fullName: true, email: true } },
              },
            },
          },
        });

        // 2. Update the project status to IN_PROGRESS
        await tx.project.update({
          where: { id: proposal.projectId },
          data: { status: ProjectStatus.IN_PROGRESS },
        });

        // 3. Reject other pending or shortlisted proposals on this project
        await tx.proposal.updateMany({
          where: {
            projectId: proposal.projectId,
            id: { not: proposalId },
            status: { in: [ProposalStatus.PENDING, ProposalStatus.SHORTLISTED] },
          },
          data: { status: ProposalStatus.REJECTED },
        });

        // 4. Ensure conversation exists between client and freelancer for this project
        const existingConv = await tx.conversation.findUnique({
          where: {
            projectId_clientId_freelancerId: {
              projectId: proposal.projectId,
              clientId: userId,
              freelancerId: proposal.freelancer.userId,
            },
          },
        });

        if (!existingConv) {
          await tx.conversation.create({
            data: {
              projectId: proposal.projectId,
              clientId: userId,
              freelancerId: proposal.freelancer.userId,
            },
          });
        }

        return acceptedProposal;
      });
    }

    if (newStatus === ProposalStatus.SHORTLISTED) {
      return await prisma.$transaction(async (tx) => {
        const updated = await tx.proposal.update({
          where: { id: proposalId },
          data: { status: ProposalStatus.SHORTLISTED },
          include: {
            freelancer: {
              include: {
                user: { select: { id: true, fullName: true, email: true } },
              },
            },
          },
        });

        // Automatically prepare conversation so client and freelancer can chat
        const existingConv = await tx.conversation.findUnique({
          where: {
            projectId_clientId_freelancerId: {
              projectId: proposal.projectId,
              clientId: userId,
              freelancerId: proposal.freelancer.userId,
            },
          },
        });

        if (!existingConv) {
          await tx.conversation.create({
            data: {
              projectId: proposal.projectId,
              clientId: userId,
              freelancerId: proposal.freelancer.userId,
            },
          });
        }

        return updated;
      });
    }

    // Default status update (e.g. REJECTED)
    return await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: newStatus },
    });
  }
}
