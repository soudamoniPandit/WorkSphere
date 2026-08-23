import { prisma } from '../../prisma';
import { AppError } from '../auth';

export interface CreateReviewDTO {
  projectId: string;
  rating: number; // 1 to 5
  comment: string;
}

export class ReviewService {
  static async createReview(reviewerUserId: string, dto: CreateReviewDTO) {
    if (!dto.projectId || !dto.comment || !dto.rating) {
      throw new AppError('Project ID, rating, and comment are required.', 400);
    }

    if (dto.rating < 1 || dto.rating > 5) {
      throw new AppError('Rating must be between 1 and 5 stars.', 400);
    }

    // 1. Check project and client ownership
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        client: true,
        proposals: {
          where: { status: 'ACCEPTED' },
          include: { freelancer: { include: { user: true } } },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.client.userId !== reviewerUserId) {
      throw new AppError('Only the project client can submit a review for this project.', 403);
    }

    // 2. Identify the hired freelancer
    const acceptedProposal = project.proposals.find((p) => p.status === 'ACCEPTED');
    if (!acceptedProposal) {
      throw new AppError('Cannot review a project without an accepted freelancer.', 400);
    }

    const revieweeUserId = acceptedProposal.freelancer.userId;

    // 3. Prevent duplicate review
    const existingReview = await prisma.review.findUnique({
      where: {
        projectId_reviewerId: {
          projectId: dto.projectId,
          reviewerId: reviewerUserId,
        },
      },
    });

    if (existingReview) {
      throw new AppError('You have already submitted a review for this project.', 400);
    }

    // 4. Create review & mark project as COMPLETED if not already
    return await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          projectId: dto.projectId,
          reviewerId: reviewerUserId,
          revieweeId: revieweeUserId,
          rating: Math.round(dto.rating),
          comment: dto.comment.trim(),
        },
        include: {
          reviewer: { select: { id: true, fullName: true, avatarUrl: true } },
          project: { select: { id: true, title: true } },
        },
      });

      // Update project status to COMPLETED
      await tx.project.update({
        where: { id: dto.projectId },
        data: { status: 'COMPLETED' },
      });

      return review;
    });
  }

  static async getProjectReviews(projectId: string) {
    return await prisma.review.findMany({
      where: { projectId },
      include: {
        reviewer: { select: { id: true, fullName: true, avatarUrl: true } },
        reviewee: { select: { id: true, fullName: true, avatarUrl: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
