import { supabase } from '../supabase';
import { AppError } from '../auth';
import { ProjectStatus, Role, ProposalStatus } from '@/types/database';


export interface CreateProjectDTO {
  title: string;
  description: string;
  budget: number;
  deadline?: string;
  skills: string[];
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
    const { data: clientProfile, error: clientError } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (clientError || !clientProfile) {
      throw new AppError('Client profile not found. Only clients can create projects.', 404);
    }

    const clientId = clientProfile.id;

    // 1. Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        client_id: clientId,
        title: dto.title.trim(),
        description: dto.description.trim(),
        budget: dto.budget,
        deadline: dto.deadline ? new Date(dto.deadline).toISOString() : null,
        status: ProjectStatus.OPEN,
      })
      .select('id, client_id, title, description, budget, deadline, status, created_at, updated_at')
      .single();

    if (projectError || !project) {
      throw new AppError(`Failed to create project: ${projectError?.message}`, 500);
    }

    // 2. Link Skills
    if (dto.skills && dto.skills.length > 0) {
      for (const skillName of dto.skills) {
        const trimmed = skillName.trim();
        if (!trimmed) continue;

        // Upsert skill
        let { data: skill } = await supabase
          .from('skills')
          .select('id')
          .eq('name', trimmed)
          .maybeSingle();

        if (!skill) {
          const { data: newSkill } = await supabase
            .from('skills')
            .insert({ name: trimmed })
            .select('id')
            .single();
          skill = newSkill;
        }

        if (skill) {
          await supabase.from('project_skills').upsert(
            { project_id: project.id, skill_id: skill.id },
            { onConflict: 'project_id,skill_id' }
          );
        }
      }
    }

    return await this.getProjectById(project.id);
  }

  static async getProjects(query: GetProjectsQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let dbQuery = supabase
      .from('projects')
      .select(
        `
        id,
        title,
        description,
        budget,
        deadline,
        status,
        created_at,
        updated_at,
        client_profiles (
          id,
          company_name,
          location,
          users (id, full_name, email, avatar_url)
        ),
        project_skills (
          skills (id, name)
        ),
        proposals (id)
      `,
        { count: 'exact' }
      );

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    } else {
      dbQuery = dbQuery.eq('status', ProjectStatus.OPEN);
    }

    if (query.minBudget !== undefined) {
      dbQuery = dbQuery.gte('budget', query.minBudget);
    }
    if (query.maxBudget !== undefined) {
      dbQuery = dbQuery.lte('budget', query.maxBudget);
    }

    if (query.search) {
      dbQuery = dbQuery.or(`title.ilike.%${query.search}%,description.ilike.%${query.search}%`);
    }

    dbQuery = dbQuery.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await dbQuery;

    if (error) {
      throw new AppError(`Failed to fetch projects: ${error.message}`, 500);
    }

    let projects = (data || []).map((p: any) => {
      const client = Array.isArray(p.client_profiles) ? p.client_profiles[0] : p.client_profiles;
      const user = client ? (Array.isArray(client.users) ? client.users[0] : client.users) : null;
      const skills = (p.project_skills || []).map((ps: any) => ({
        skill: {
          id: ps.skills?.id,
          name: ps.skills?.name,
        },
      }));

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        budget: p.budget,
        deadline: p.deadline,
        status: p.status,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        client: client
          ? {
              id: client.id,
              companyName: client.company_name,
              location: client.location,
              user: user
                ? {
                    id: user.id,
                    fullName: user.full_name,
                    email: user.email,
                    avatarUrl: user.avatar_url,
                  }
                : null,
            }
          : null,
        skills,
        _count: {
          proposals: Array.isArray(p.proposals) ? p.proposals.length : 0,
        },
      };
    });

    if (query.skill) {
      const skillFilter = query.skill.toLowerCase();
      projects = projects.filter((p: any) =>
        p.skills.some((s: any) => s.skill?.name?.toLowerCase().includes(skillFilter))
      );
    }

    const total = count || projects.length;
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
    const { data: p, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        budget,
        deadline,
        status,
        created_at,
        updated_at,
        client_profiles (
          id,
          company_name,
          company_website,
          description,
          location,
          users (id, full_name, email, avatar_url)
        ),
        project_skills (
          skills (id, name)
        ),
        proposals (id)
      `)
      .eq('id', projectId)
      .maybeSingle();

    if (error || !p) {
      throw new AppError('Project not found', 404);
    }

    const client = Array.isArray(p.client_profiles) ? p.client_profiles[0] : p.client_profiles;
    const user = client ? (Array.isArray(client.users) ? client.users[0] : client.users) : null;
    const skills = (p.project_skills || []).map((ps: any) => ({
      skill: {
        id: ps.skills?.id,
        name: ps.skills?.name,
      },
    }));

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      budget: p.budget,
      deadline: p.deadline,
      status: p.status,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      client: client
        ? {
            id: client.id,
            companyName: client.company_name,
            companyWebsite: client.company_website,
            description: client.description,
            location: client.location,
            user: user
              ? {
                  id: user.id,
                  fullName: user.full_name,
                  email: user.email,
                  avatarUrl: user.avatar_url,
                }
              : null,
          }
        : null,
      skills,
      _count: {
        proposals: Array.isArray(p.proposals) ? p.proposals.length : 0,
      },
    };
  }

  static async updateProject(userId: string, projectId: string, dto: UpdateProjectDTO) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, client_id, client_profiles (user_id)')
      .eq('id', projectId)
      .maybeSingle();

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const client = Array.isArray(project.client_profiles)
      ? project.client_profiles[0]
      : project.client_profiles;

    if (!client || client.user_id !== userId) {
      throw new AppError('Unauthorized to modify this project', 403);
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (dto.title !== undefined) updateData.title = dto.title.trim();
    if (dto.description !== undefined) updateData.description = dto.description.trim();
    if (dto.budget !== undefined) updateData.budget = dto.budget;
    if (dto.deadline !== undefined)
      updateData.deadline = dto.deadline ? new Date(dto.deadline).toISOString() : null;
    if (dto.status !== undefined) updateData.status = dto.status;

    await supabase.from('projects').update(updateData).eq('id', projectId);

    if (dto.skills && Array.isArray(dto.skills)) {
      await supabase.from('project_skills').delete().eq('project_id', projectId);

      for (const skillName of dto.skills) {
        const trimmed = skillName.trim();
        if (!trimmed) continue;

        let { data: skill } = await supabase
          .from('skills')
          .select('id')
          .eq('name', trimmed)
          .maybeSingle();

        if (!skill) {
          const { data: newSkill } = await supabase
            .from('skills')
            .insert({ name: trimmed })
            .select('id')
            .single();
          skill = newSkill;
        }

        if (skill) {
          await supabase.from('project_skills').insert({
            project_id: projectId,
            skill_id: skill.id,
          });
        }
      }
    }

    return await this.getProjectById(projectId);
  }

  static async deleteProject(userId: string, projectId: string) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, client_profiles (user_id)')
      .eq('id', projectId)
      .maybeSingle();

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const client = Array.isArray(project.client_profiles)
      ? project.client_profiles[0]
      : project.client_profiles;

    if (!client || client.user_id !== userId) {
      throw new AppError('Unauthorized to delete this project', 403);
    }

    await supabase.from('projects').delete().eq('id', projectId);
    return { message: 'Project deleted successfully' };
  }

  static async getClientProjects(userId: string) {
    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!clientProfile) {
      throw new AppError('Client profile not found', 404);
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        budget,
        deadline,
        status,
        created_at,
        updated_at,
        project_skills (
          skills (id, name)
        ),
        proposals (
          id,
          status,
          proposed_price,
          estimated_days,
          created_at,
          freelancer_profiles (
            users (id, full_name, avatar_url)
          )
        )
      `)
      .eq('client_id', clientProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(`Failed to fetch client projects: ${error.message}`, 500);
    }

    return (projects || []).map((p: any) => {
      const skills = (p.project_skills || []).map((ps: any) => ({
        skill: {
          id: ps.skills?.id,
          name: ps.skills?.name,
        },
      }));

      const proposals = (p.proposals || []).map((prop: any) => {
        const fp = Array.isArray(prop.freelancer_profiles)
          ? prop.freelancer_profiles[0]
          : prop.freelancer_profiles;
        const u = fp ? (Array.isArray(fp.users) ? fp.users[0] : fp.users) : null;
        return {
          id: prop.id,
          status: prop.status,
          proposedPrice: prop.proposed_price,
          estimatedDays: prop.estimated_days,
          createdAt: prop.created_at,
          freelancer: {
            user: u
              ? {
                  id: u.id,
                  fullName: u.full_name,
                  avatarUrl: u.avatar_url,
                }
              : null,
          },
        };
      });

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        budget: p.budget,
        deadline: p.deadline,
        status: p.status,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        skills,
        proposals,
        _count: { proposals: proposals.length },
      };
    });
  }

  static async getDashboardStats(userId: string, role: Role) {
    if (role === Role.CLIENT) {
      const { data: user } = await supabase
        .from('users')
        .select('id, full_name, email, client_profiles (id)')
        .eq('id', userId)
        .maybeSingle();

      const client = user
        ? Array.isArray(user.client_profiles)
          ? user.client_profiles[0]
          : user.client_profiles
        : null;

      if (!user || !client) {
        throw new AppError('Client profile not found', 404);
      }

      const clientId = client.id;

      const { data: projects } = await supabase
        .from('projects')
        .select('id, title, status, budget, created_at, project_skills(skills(id, name)), proposals(id)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      const allProjects = projects || [];
      const totalProjects = allProjects.length;
      const openProjects = allProjects.filter((p) => p.status === ProjectStatus.OPEN).length;
      const activeProjects = allProjects.filter((p) => p.status === ProjectStatus.IN_PROGRESS).length;
      const completedProjects = allProjects.filter((p) => p.status === ProjectStatus.COMPLETED).length;

      const projectIds = allProjects.map((p) => p.id);

      let totalProposals = 0;
      let shortlistedProposals = 0;
      let recentProposals: any[] = [];

      if (projectIds.length > 0) {
        const { data: props } = await supabase
          .from('proposals')
          .select(`
            id,
            status,
            proposed_price,
            estimated_days,
            created_at,
            projects (id, title, status, budget),
            freelancer_profiles (
              users (id, full_name, avatar_url),
              freelancer_skills (skills (id, name))
            )
          `)
          .in('project_id', projectIds)
          .order('created_at', { ascending: false });

        const allProps = props || [];
        totalProposals = allProps.length;
        shortlistedProposals = allProps.filter((pr) => pr.status === ProposalStatus.SHORTLISTED).length;

        recentProposals = allProps.slice(0, 5).map((pr: any) => {
          const prProject = Array.isArray(pr.projects) ? pr.projects[0] : pr.projects;
          const prFreelancer = Array.isArray(pr.freelancer_profiles)
            ? pr.freelancer_profiles[0]
            : pr.freelancer_profiles;
          const prUser = prFreelancer
            ? Array.isArray(prFreelancer.users)
              ? prFreelancer.users[0]
              : prFreelancer.users
            : null;
          const prSkills = prFreelancer
            ? (prFreelancer.freelancer_skills || []).map((fs: any) => ({
                skill: { id: fs.skills?.id, name: fs.skills?.name },
              }))
            : [];

          return {
            id: pr.id,
            status: pr.status,
            proposedPrice: pr.proposed_price,
            estimatedDays: pr.estimated_days,
            createdAt: pr.created_at,
            project: prProject,
            freelancer: {
              user: prUser
                ? {
                    id: prUser.id,
                    fullName: prUser.full_name,
                    avatarUrl: prUser.avatar_url,
                  }
                : null,
              skills: prSkills,
            },
          };
        });
      }

      const formattedRecentProjects = allProjects.slice(0, 5).map((p: any) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        budget: p.budget,
        createdAt: p.created_at,
        skills: (p.project_skills || []).map((ps: any) => ({
          skill: { id: ps.skills?.id, name: ps.skills?.name },
        })),
        _count: { proposals: Array.isArray(p.proposals) ? p.proposals.length : 0 },
      }));

      return {
        role: Role.CLIENT,
        user: { fullName: user.full_name, email: user.email },
        metrics: {
          totalProjects,
          openProjects,
          activeProjects,
          completedProjects,
          totalProposals,
          shortlistedProposals,
        },
        recentProjects: formattedRecentProjects,
        recentProposals,
      };
    } else if (role === Role.FREELANCER) {
      const { data: user } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          freelancer_profiles (
            id,
            title,
            freelancer_skills (skills (id, name)),
            portfolio_projects (id)
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      const freelancer = user
        ? Array.isArray(user.freelancer_profiles)
          ? user.freelancer_profiles[0]
          : user.freelancer_profiles
        : null;

      if (!user || !freelancer) {
        throw new AppError('Freelancer profile not found', 404);
      }

      const freelancerId = freelancer.id;

      // Proposals by this freelancer
      const { data: myProposalsData } = await supabase
        .from('proposals')
        .select(`
          id,
          status,
          proposed_price,
          estimated_days,
          created_at,
          projects (
            id,
            title,
            budget,
            status,
            client_profiles (
              users (id, full_name, avatar_url)
            )
          )
        `)
        .eq('freelancer_id', freelancerId)
        .order('created_at', { ascending: false });

      const allMyProposals = myProposalsData || [];
      const myProposalsCount = allMyProposals.length;
      const pendingProposalsCount = allMyProposals.filter((p) => p.status === ProposalStatus.PENDING).length;
      const shortlistedProposalsCount = allMyProposals.filter((p) => p.status === ProposalStatus.SHORTLISTED).length;
      const acceptedProposalsCount = allMyProposals.filter((p) => p.status === ProposalStatus.ACCEPTED).length;

      // Available open projects
      const { data: openProjectsData, count: openCount } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          budget,
          deadline,
          status,
          created_at,
          client_profiles (
            users (id, full_name, avatar_url)
          ),
          project_skills (skills (id, name)),
          proposals (id)
        `, { count: 'exact' })
        .eq('status', ProjectStatus.OPEN)
        .order('created_at', { ascending: false })
        .limit(5);

      const recentProposals = allMyProposals.slice(0, 5).map((pr: any) => {
        const prProject = Array.isArray(pr.projects) ? pr.projects[0] : pr.projects;
        const prClient = prProject
          ? Array.isArray(prProject.client_profiles)
            ? prProject.client_profiles[0]
            : prProject.client_profiles
          : null;
        const prUser = prClient
          ? Array.isArray(prClient.users)
            ? prClient.users[0]
            : prClient.users
          : null;

        return {
          id: pr.id,
          status: pr.status,
          proposedPrice: pr.proposed_price,
          estimatedDays: pr.estimated_days,
          createdAt: pr.created_at,
          project: prProject
            ? {
                id: prProject.id,
                title: prProject.title,
                budget: prProject.budget,
                status: prProject.status,
                client: {
                  user: prUser
                    ? {
                        id: prUser.id,
                        fullName: prUser.full_name,
                        avatarUrl: prUser.avatar_url,
                      }
                    : null,
                },
              }
            : null,
        };
      });

      const availableProjects = (openProjectsData || []).map((p: any) => {
        const client = Array.isArray(p.client_profiles) ? p.client_profiles[0] : p.client_profiles;
        const u = client ? (Array.isArray(client.users) ? client.users[0] : client.users) : null;
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          budget: p.budget,
          deadline: p.deadline,
          status: p.status,
          createdAt: p.created_at,
          client: {
            user: u
              ? {
                  id: u.id,
                  fullName: u.full_name,
                  avatarUrl: u.avatar_url,
                }
              : null,
          },
          skills: (p.project_skills || []).map((ps: any) => ({
            skill: { id: ps.skills?.id, name: ps.skills?.name },
          })),
          _count: { proposals: Array.isArray(p.proposals) ? p.proposals.length : 0 },
        };
      });

      const skillsCount = (freelancer.freelancer_skills || []).length;

      return {
        role: Role.FREELANCER,
        user: {
          fullName: user.full_name,
          email: user.email,
          profileComplete: !!(freelancer.title && skillsCount > 0),
        },
        metrics: {
          availableProjects: openCount || availableProjects.length,
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
