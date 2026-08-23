import { prisma } from '../../prisma';
import { AppError } from '../auth';
import { Role, ProposalStatus } from '@prisma/client';

export class ChatService {
  static async getConversations(userId: string) {
    return await prisma.conversation.findMany({
      where: {
        OR: [{ clientId: userId }, { freelancerId: userId }],
      },
      include: {
        project: {
          select: { id: true, title: true, status: true, budget: true },
        },
        client: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        freelancer: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getOrCreateConversation(
    userId: string,
    userRole: Role,
    projectId: string,
    otherUserId: string
  ) {
    let clientId: string;
    let freelancerId: string;

    if (userRole === Role.CLIENT) {
      clientId = userId;
      freelancerId = otherUserId;
    } else if (userRole === Role.FREELANCER) {
      clientId = otherUserId;
      freelancerId = userId;
    } else {
      throw new AppError('Only clients and freelancers can participate in conversations.', 403);
    }

    const freelancer = await prisma.user.findUnique({
      where: { id: freelancerId },
      include: { freelancerProfile: true },
    });

    if (!freelancer || !freelancer.freelancerProfile) {
      throw new AppError('Freelancer profile not found.', 404);
    }

    // Verify chat access rule: Proposal must be SHORTLISTED or ACCEPTED
    const eligibleProposal = await prisma.proposal.findFirst({
      where: {
        projectId,
        freelancerId: freelancer.freelancerProfile.id,
        status: {
          in: [ProposalStatus.SHORTLISTED, ProposalStatus.ACCEPTED],
        },
      },
    });

    if (!eligibleProposal) {
      throw new AppError(
        'Direct messaging is only permitted once a proposal has been shortlisted or accepted.',
        403
      );
    }

    // Upsert or find conversation
    const conversation = await prisma.conversation.upsert({
      where: {
        projectId_clientId_freelancerId: {
          projectId,
          clientId,
          freelancerId,
        },
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        projectId,
        clientId,
        freelancerId,
      },
      include: {
        project: {
          select: { id: true, title: true, status: true, budget: true },
        },
        client: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        freelancer: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
      },
    });

    return conversation;
  }

  static async getMessages(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        project: { select: { id: true, title: true, status: true } },
        client: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        freelancer: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });

    if (!conversation) {
      throw new AppError('Conversation not found.', 404);
    }

    if (conversation.clientId !== userId && conversation.freelancerId !== userId) {
      throw new AppError('Unauthorized: You do not have access to this conversation.', 403);
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      conversation,
      messages,
    };
  }

  static async sendMessage(userId: string, conversationId: string, content: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new AppError('Conversation not found.', 404);
    }

    if (conversation.clientId !== userId && conversation.freelancerId !== userId) {
      throw new AppError('Unauthorized: You cannot post messages in this conversation.', 403);
    }

    const trimmedContent = content?.trim();
    if (!trimmedContent) {
      throw new AppError('Message content cannot be empty.', 400);
    }

    return await prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: trimmedContent,
        },
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true, role: true },
          },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    });
  }
}
