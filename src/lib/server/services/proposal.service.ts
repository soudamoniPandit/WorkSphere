import { supabase } from '@/lib/supabase';
import { AppError } from '../auth';
import { Role, ProposalStatus, ProjectStatus } from '@/types/database';

export interface SubmitProposalDTO {
  coverLetter: string;
  proposedPrice: number;
  estimatedDays: number;
}

export class ProposalService {
  static async submitProposal(userId: string, projectId: string, dto: SubmitProposalDTO) {
    const { data: freelancerUser } = await supabase
      .from('users')
      .select('id, freelancer_profiles (id)')
      .eq('id', userId)
      .maybeSingle();

    const fp = freelancerUser
      ? Array.isArray(freelancerUser.freelancer_profiles)
        ? freelancerUser.freelancer_profiles[0]
        : freelancerUser.freelancer_profiles
      : null;

    if (!freelancerUser || !fp) {
      throw new AppError('Freelancer profile not found. Only freelancers can submit proposals.', 403);
    }

    const freelancerProfileId = fp.id;

    // Check project status
    const { data: project } = await supabase
      .from('projects')
      .select('id, status, client_id, client_profiles (user_id)')
      .eq('id', projectId)
      .maybeSingle();

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    if (project.status !== ProjectStatus.OPEN) {
      throw new AppError('Proposals can only be submitted to OPEN projects.', 400);
    }

    const client = Array.isArray(project.client_profiles)
      ? project.client_profiles[0]
      : project.client_profiles;

    if (client && client.user_id === userId) {
      throw new AppError('You cannot submit a proposal to your own project.', 400);
    }

    // Check if already submitted
    const { data: existingProposal } = await supabase
      .from('proposals')
      .select('id')
      .eq('project_id', projectId)
      .eq('freelancer_id', freelancerProfileId)
      .maybeSingle();

    if (existingProposal) {
      throw new AppError('You have already submitted a proposal for this project.', 400);
    }

    const { data: newProposal, error } = await supabase
      .from('proposals')
      .insert({
        project_id: projectId,
        freelancer_id: freelancerProfileId,
        cover_letter: dto.coverLetter.trim(),
        proposed_price: dto.proposedPrice,
        estimated_days: dto.estimatedDays,
        status: ProposalStatus.PENDING,
      })
      .select('id')
      .single();

    if (error || !newProposal) {
      throw new AppError(`Failed to submit proposal: ${error?.message}`, 500);
    }

    return await this.getProposalById(userId, Role.FREELANCER, newProposal.id);
  }

  static async getProposalsForProject(userId: string, userRole: Role, projectId: string) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, client_id, client_profiles (user_id)')
      .eq('id', projectId)
      .maybeSingle();

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    const client = Array.isArray(project.client_profiles)
      ? project.client_profiles[0]
      : project.client_profiles;

    if (userRole === Role.CLIENT) {
      if (!client || client.user_id !== userId) {
        throw new AppError('Unauthorized: You can only view proposals for your own projects.', 403);
      }

      const { data: proposals } = await supabase
        .from('proposals')
        .select(`
          id,
          cover_letter,
          proposed_price,
          estimated_days,
          status,
          created_at,
          updated_at,
          freelancer_profiles (
            id,
            title,
            bio,
            hourly_rate,
            experience_years,
            location,
            users (id, full_name, email, avatar_url),
            freelancer_skills (skills (id, name)),
            portfolio_projects (id, title, description, project_url, image_url)
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      return (proposals || []).map((prop: any) => {
        const freelancer = Array.isArray(prop.freelancer_profiles)
          ? prop.freelancer_profiles[0]
          : prop.freelancer_profiles;
        const u = freelancer
          ? Array.isArray(freelancer.users)
            ? freelancer.users[0]
            : freelancer.users
          : null;
        const skills = freelancer
          ? (freelancer.freelancer_skills || []).map((fs: any) => ({
              skill: { id: fs.skills?.id, name: fs.skills?.name },
            }))
          : [];
        const portfolioProjects = freelancer ? freelancer.portfolio_projects || [] : [];

        return {
          id: prop.id,
          coverLetter: prop.cover_letter,
          proposedPrice: prop.proposed_price,
          estimatedDays: prop.estimated_days,
          status: prop.status,
          createdAt: prop.created_at,
          updatedAt: prop.updated_at,
          freelancer: {
            id: freelancer?.id,
            title: freelancer?.title,
            bio: freelancer?.bio,
            hourlyRate: freelancer?.hourly_rate,
            experienceYears: freelancer?.experience_years,
            location: freelancer?.location,
            user: u
              ? {
                  id: u.id,
                  fullName: u.full_name,
                  email: u.email,
                  avatarUrl: u.avatar_url,
                }
              : null,
            skills,
            portfolioProjects,
          },
        };
      });
    } else if (userRole === Role.FREELANCER) {
      const { data: user } = await supabase
        .from('users')
        .select('id, freelancer_profiles (id)')
        .eq('id', userId)
        .maybeSingle();

      const fProfile = user
        ? Array.isArray(user.freelancer_profiles)
          ? user.freelancer_profiles[0]
          : user.freelancer_profiles
        : null;

      if (!fProfile) {
        return [];
      }

      const { data: proposals } = await supabase
        .from('proposals')
        .select(`
          id,
          cover_letter,
          proposed_price,
          estimated_days,
          status,
          created_at,
          freelancer_profiles (
            users (id, full_name, email, avatar_url),
            freelancer_skills (skills (id, name))
          )
        `)
        .eq('project_id', projectId)
        .eq('freelancer_id', fProfile.id);

      return (proposals || []).map((prop: any) => {
        const freelancer = Array.isArray(prop.freelancer_profiles)
          ? prop.freelancer_profiles[0]
          : prop.freelancer_profiles;
        const u = freelancer
          ? Array.isArray(freelancer.users)
            ? freelancer.users[0]
            : freelancer.users
          : null;
        const skills = freelancer
          ? (freelancer.freelancer_skills || []).map((fs: any) => ({
              skill: { id: fs.skills?.id, name: fs.skills?.name },
            }))
          : [];

        return {
          id: prop.id,
          coverLetter: prop.cover_letter,
          proposedPrice: prop.proposed_price,
          estimatedDays: prop.estimated_days,
          status: prop.status,
          createdAt: prop.created_at,
          freelancer: {
            user: u
              ? { id: u.id, fullName: u.full_name, email: u.email, avatarUrl: u.avatar_url }
              : null,
            skills,
          },
        };
      });
    }

    throw new AppError('Access denied.', 403);
  }

  static async getMyProposals(userId: string) {
    const { data: user } = await supabase
      .from('users')
      .select('id, freelancer_profiles (id)')
      .eq('id', userId)
      .maybeSingle();

    const fp = user
      ? Array.isArray(user.freelancer_profiles)
        ? user.freelancer_profiles[0]
        : user.freelancer_profiles
      : null;

    if (!user || !fp) {
      throw new AppError('Freelancer profile not found.', 404);
    }

    const { data: proposals } = await supabase
      .from('proposals')
      .select(`
        id,
        cover_letter,
        proposed_price,
        estimated_days,
        status,
        created_at,
        projects (
          id,
          title,
          description,
          budget,
          deadline,
          status,
          client_profiles (
            users (id, full_name, email, avatar_url)
          ),
          project_skills (skills (id, name))
        )
      `)
      .eq('freelancer_id', fp.id)
      .order('created_at', { ascending: false });

    return (proposals || []).map((prop: any) => {
      const project = Array.isArray(prop.projects) ? prop.projects[0] : prop.projects;
      const client = project
        ? Array.isArray(project.client_profiles)
          ? project.client_profiles[0]
          : project.client_profiles
        : null;
      const u = client ? (Array.isArray(client.users) ? client.users[0] : client.users) : null;
      const skills = project
        ? (project.project_skills || []).map((ps: any) => ({
            skill: { id: ps.skills?.id, name: ps.skills?.name },
          }))
        : [];

      return {
        id: prop.id,
        coverLetter: prop.cover_letter,
        proposedPrice: prop.proposed_price,
        estimatedDays: prop.estimated_days,
        status: prop.status,
        createdAt: prop.created_at,
        project: project
          ? {
              id: project.id,
              title: project.title,
              description: project.description,
              budget: project.budget,
              deadline: project.deadline,
              status: project.status,
              client: {
                user: u
                  ? {
                      id: u.id,
                      fullName: u.full_name,
                      email: u.email,
                      avatarUrl: u.avatar_url,
                    }
                  : null,
              },
              skills,
            }
          : null,
      };
    });
  }

  static async getProposalById(userId: string, userRole: Role, proposalId: string) {
    const { data: prop } = await supabase
      .from('proposals')
      .select(`
        id,
        project_id,
        freelancer_id,
        cover_letter,
        proposed_price,
        estimated_days,
        status,
        created_at,
        projects (
          id,
          title,
          description,
          budget,
          deadline,
          status,
          client_profiles (
            user_id,
            users (id, full_name, email)
          ),
          project_skills (skills (id, name))
        ),
        freelancer_profiles (
          user_id,
          users (id, full_name, email, avatar_url),
          freelancer_skills (skills (id, name)),
          portfolio_projects (id, title, description, project_url, image_url)
        )
      `)
      .eq('id', proposalId)
      .maybeSingle();

    if (!prop) {
      throw new AppError('Proposal not found.', 404);
    }

    const project = Array.isArray(prop.projects) ? prop.projects[0] : prop.projects;
    const client = project
      ? Array.isArray(project.client_profiles)
        ? project.client_profiles[0]
        : project.client_profiles
      : null;
    const clientUser = client
      ? Array.isArray(client.users)
        ? client.users[0]
        : client.users
      : null;

    const freelancer = Array.isArray(prop.freelancer_profiles)
      ? prop.freelancer_profiles[0]
      : prop.freelancer_profiles;
    const freelancerUser = freelancer
      ? Array.isArray(freelancer.users)
        ? freelancer.users[0]
        : freelancer.users
      : null;

    if (userRole === Role.CLIENT && client?.user_id !== userId) {
      throw new AppError('Unauthorized to view this proposal.', 403);
    }

    if (userRole === Role.FREELANCER && freelancer?.user_id !== userId) {
      throw new AppError('Unauthorized to view this proposal.', 403);
    }

    const skills = project
      ? (project.project_skills || []).map((ps: any) => ({
          skill: { id: ps.skills?.id, name: ps.skills?.name },
        }))
      : [];
    const freelancerSkills = freelancer
      ? (freelancer.freelancer_skills || []).map((fs: any) => ({
          skill: { id: fs.skills?.id, name: fs.skills?.name },
        }))
      : [];
    const portfolioProjects = freelancer ? freelancer.portfolio_projects || [] : [];

    return {
      id: prop.id,
      coverLetter: prop.cover_letter,
      proposedPrice: prop.proposed_price,
      estimatedDays: prop.estimated_days,
      status: prop.status,
      createdAt: prop.created_at,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        budget: project.budget,
        deadline: project.deadline,
        status: project.status,
        client: {
          user: clientUser
            ? { id: clientUser.id, fullName: clientUser.full_name, email: clientUser.email }
            : null,
        },
        skills,
      },
      freelancer: {
        user: freelancerUser
          ? {
              id: freelancerUser.id,
              fullName: freelancerUser.full_name,
              email: freelancerUser.email,
              avatarUrl: freelancerUser.avatar_url,
            }
          : null,
        skills: freelancerSkills,
        portfolioProjects,
      },
    };
  }

  static async updateProposalStatus(userId: string, proposalId: string, newStatus: ProposalStatus) {
    const { data: proposal } = await supabase
      .from('proposals')
      .select(`
        id,
        project_id,
        freelancer_id,
        projects (
          id,
          client_profiles (user_id)
        ),
        freelancer_profiles (
          user_id,
          users (id, full_name, email)
        )
      `)
      .eq('id', proposalId)
      .maybeSingle();

    if (!proposal) {
      throw new AppError('Proposal not found.', 404);
    }

    const project = Array.isArray(proposal.projects) ? proposal.projects[0] : proposal.projects;
    const client = project
      ? Array.isArray(project.client_profiles)
        ? project.client_profiles[0]
        : project.client_profiles
      : null;

    if (!client || client.user_id !== userId) {
      throw new AppError('Unauthorized: Only the project owner client can update proposal status.', 403);
    }

    const freelancer = Array.isArray(proposal.freelancer_profiles)
      ? proposal.freelancer_profiles[0]
      : proposal.freelancer_profiles;

    if (newStatus === ProposalStatus.ACCEPTED) {
      // 1. Update proposal to ACCEPTED
      await supabase
        .from('proposals')
        .update({ status: ProposalStatus.ACCEPTED, updated_at: new Date().toISOString() })
        .eq('id', proposalId);

      // 2. Update project status to IN_PROGRESS
      await supabase
        .from('projects')
        .update({ status: ProjectStatus.IN_PROGRESS, updated_at: new Date().toISOString() })
        .eq('id', proposal.project_id);

      // 3. Reject other proposals on this project
      await supabase
        .from('proposals')
        .update({ status: ProposalStatus.REJECTED, updated_at: new Date().toISOString() })
        .eq('project_id', proposal.project_id)
        .neq('id', proposalId)
        .in('status', [ProposalStatus.PENDING, ProposalStatus.SHORTLISTED]);

      // 4. Ensure conversation exists
      if (freelancer?.user_id) {
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('id')
          .eq('project_id', proposal.project_id)
          .eq('client_id', userId)
          .eq('freelancer_id', freelancer.user_id)
          .maybeSingle();

        if (!existingConv) {
          await supabase.from('conversations').insert({
            project_id: proposal.project_id,
            client_id: userId,
            freelancer_id: freelancer.user_id,
          });
        }
      }

      return { id: proposalId, status: ProposalStatus.ACCEPTED };
    }

    if (newStatus === ProposalStatus.SHORTLISTED) {
      await supabase
        .from('proposals')
        .update({ status: ProposalStatus.SHORTLISTED, updated_at: new Date().toISOString() })
        .eq('id', proposalId);

      if (freelancer?.user_id) {
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('id')
          .eq('project_id', proposal.project_id)
          .eq('client_id', userId)
          .eq('freelancer_id', freelancer.user_id)
          .maybeSingle();

        if (!existingConv) {
          await supabase.from('conversations').insert({
            project_id: proposal.project_id,
            client_id: userId,
            freelancer_id: freelancer.user_id,
          });
        }
      }

      return { id: proposalId, status: ProposalStatus.SHORTLISTED };
    }

    await supabase
      .from('proposals')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', proposalId);

    return { id: proposalId, status: newStatus };
  }
}
