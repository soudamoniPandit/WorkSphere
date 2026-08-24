import { supabase } from '../supabase';
import { AppError } from '../auth';
import { ProjectStatus } from '@/types/database';


export interface CreateReviewDTO {
  projectId: string;
  rating: number;
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
    const { data: project } = await supabase
      .from('projects')
      .select(`
        id,
        client_profiles (user_id),
        proposals (
          id,
          status,
          freelancer_profiles (user_id)
        )
      `)
      .eq('id', dto.projectId)
      .maybeSingle();

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const client = Array.isArray(project.client_profiles)
      ? project.client_profiles[0]
      : project.client_profiles;

    if (!client || client.user_id !== reviewerUserId) {
      throw new AppError('Only the project client can submit a review for this project.', 403);
    }

    // 2. Identify the hired freelancer
    const proposals = project.proposals || [];
    const acceptedProposal = proposals.find((p: any) => p.status === 'ACCEPTED');
    if (!acceptedProposal) {
      throw new AppError('Cannot review a project without an accepted freelancer.', 400);
    }

    const fp = Array.isArray(acceptedProposal.freelancer_profiles)
      ? acceptedProposal.freelancer_profiles[0]
      : acceptedProposal.freelancer_profiles;

    if (!fp || !fp.user_id) {
      throw new AppError('Freelancer user record not found.', 400);
    }

    const targetUserId = fp.user_id;

    // 3. Prevent duplicate review
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('project_id', dto.projectId)
      .eq('author_id', reviewerUserId)
      .maybeSingle();

    if (existingReview) {
      throw new AppError('You have already submitted a review for this project.', 400);
    }

    // 4. Create review & mark project as COMPLETED
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        project_id: dto.projectId,
        author_id: reviewerUserId,
        target_id: targetUserId,
        rating: Math.round(dto.rating),
        comment: dto.comment.trim(),
      })
      .select(`
        id,
        rating,
        comment,
        created_at,
        users!author_id (id, full_name, avatar_url),
        projects (id, title)
      `)
      .single();

    if (error || !review) {
      throw new AppError(`Failed to save review: ${error?.message}`, 500);
    }

    await supabase
      .from('projects')
      .update({ status: ProjectStatus.COMPLETED, updated_at: new Date().toISOString() })
      .eq('id', dto.projectId);

    const reviewer = Array.isArray(review.users) ? review.users[0] : review.users;
    const pr = Array.isArray(review.projects) ? review.projects[0] : review.projects;

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      reviewer: reviewer
        ? { id: reviewer.id, fullName: reviewer.full_name, avatarUrl: reviewer.avatar_url }
        : null,
      project: pr ? { id: pr.id, title: pr.title } : null,
    };
  }

  static async getProjectReviews(projectId: string) {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        reviewer:users!author_id (id, full_name, avatar_url),
        target:users!target_id (id, full_name, avatar_url),
        project:projects (id, title)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(`Failed to fetch reviews: ${error.message}`, 500);
    }

    return (reviews || []).map((r: any) => {
      const reviewer = Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer;
      const target = Array.isArray(r.target) ? r.target[0] : r.target;
      const pr = Array.isArray(r.project) ? r.project[0] : r.project;

      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        reviewer: reviewer
          ? { id: reviewer.id, fullName: reviewer.full_name, avatarUrl: reviewer.avatar_url }
          : null,
        reviewee: target
          ? { id: target.id, fullName: target.full_name, avatarUrl: target.avatar_url }
          : null,
        project: pr ? { id: pr.id, title: pr.title } : null,
      };
    });
  }
}
