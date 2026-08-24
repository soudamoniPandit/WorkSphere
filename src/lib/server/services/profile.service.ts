import { supabase } from '@/lib/supabase';
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
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        avatar_url,
        created_at,
        client_profiles (
          id,
          company_name,
          company_website,
          description,
          location
        ),
        freelancer_profiles (
          id,
          title,
          bio,
          hourly_rate,
          experience_years,
          location,
          freelancer_skills (skills (id, name)),
          portfolio_projects (id, title, description, project_url, image_url, created_at),
          proposals (
            id,
            status,
            projects (
              id,
              title,
              client_profiles (
                users (id, full_name, avatar_url)
              ),
              reviews (id, rating, comment, created_at)
            )
          )
        ),
        reviews_received:reviews!target_id (
          id,
          rating,
          comment,
          created_at,
          reviewer:users!author_id (id, full_name, avatar_url),
          project:projects (id, title)
        )
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      throw new AppError('User profile not found', 404);
    }

    const clientProfile = Array.isArray(user.client_profiles)
      ? user.client_profiles[0]
      : user.client_profiles;

    const rawFreelancer = Array.isArray(user.freelancer_profiles)
      ? user.freelancer_profiles[0]
      : user.freelancer_profiles;

    let freelancerProfile = null;
    if (rawFreelancer) {
      const skills = (rawFreelancer.freelancer_skills || []).map((fs: any) => ({
        skill: { id: fs.skills?.id, name: fs.skills?.name },
      }));

      const portfolioProjects = rawFreelancer.portfolio_projects || [];

      const acceptedProposals = (rawFreelancer.proposals || [])
        .filter((pr: any) => pr.status === 'ACCEPTED')
        .map((pr: any) => {
          const project = Array.isArray(pr.projects) ? pr.projects[0] : pr.projects;
          const client = project
            ? Array.isArray(project.client_profiles)
              ? project.client_profiles[0]
              : project.client_profiles
            : null;
          const u = client
            ? Array.isArray(client.users)
              ? client.users[0]
              : client.users
            : null;

          return {
            id: pr.id,
            status: pr.status,
            project: project
              ? {
                  id: project.id,
                  title: project.title,
                  client: {
                    user: u
                      ? { id: u.id, fullName: u.full_name, avatarUrl: u.avatar_url }
                      : null,
                  },
                  reviews: project.reviews || [],
                }
              : null,
          };
        });

      freelancerProfile = {
        id: rawFreelancer.id,
        title: rawFreelancer.title,
        bio: rawFreelancer.bio,
        hourlyRate: rawFreelancer.hourly_rate,
        experienceYears: rawFreelancer.experience_years,
        location: rawFreelancer.location,
        skills,
        portfolioProjects,
        proposals: acceptedProposals,
      };
    }

    const reviewsReceived = (user.reviews_received || []).map((r: any) => {
      const reviewer = Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer;
      const project = Array.isArray(r.project) ? r.project[0] : r.project;

      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        reviewer: reviewer
          ? { id: reviewer.id, fullName: reviewer.full_name, avatarUrl: reviewer.avatar_url }
          : null,
        project: project ? { id: project.id, title: project.title } : null,
      };
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      clientProfile: clientProfile
        ? {
            id: clientProfile.id,
            companyName: clientProfile.company_name,
            companyWebsite: clientProfile.company_website,
            description: clientProfile.description,
            location: clientProfile.location,
          }
        : null,
      freelancerProfile,
      reviewsReceived,
    };
  }

  static async updateClientProfile(userId: string, dto: UpdateClientProfileDTO) {
    if (dto.fullName || dto.avatarUrl !== undefined) {
      const userUpdate: any = { updated_at: new Date().toISOString() };
      if (dto.fullName) userUpdate.full_name = dto.fullName.trim();
      if (dto.avatarUrl !== undefined) userUpdate.avatar_url = dto.avatarUrl;

      await supabase.from('users').update(userUpdate).eq('id', userId);
    }

    const profileUpdate: any = { updated_at: new Date().toISOString() };
    if (dto.companyName !== undefined) profileUpdate.company_name = dto.companyName;
    if (dto.companyWebsite !== undefined) profileUpdate.company_website = dto.companyWebsite;
    if (dto.description !== undefined) profileUpdate.description = dto.description;
    if (dto.location !== undefined) profileUpdate.location = dto.location;

    await supabase.from('client_profiles').update(profileUpdate).eq('user_id', userId);

    return await this.getProfile(userId);
  }

  static async updateFreelancerProfile(userId: string, dto: UpdateFreelancerProfileDTO) {
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
      throw new AppError('Freelancer profile not found', 404);
    }

    const freelancerProfileId = fp.id;

    if (dto.fullName || dto.avatarUrl !== undefined) {
      const userUpdate: any = { updated_at: new Date().toISOString() };
      if (dto.fullName) userUpdate.full_name = dto.fullName.trim();
      if (dto.avatarUrl !== undefined) userUpdate.avatar_url = dto.avatarUrl;

      await supabase.from('users').update(userUpdate).eq('id', userId);
    }

    const profileUpdate: any = { updated_at: new Date().toISOString() };
    if (dto.title !== undefined) profileUpdate.title = dto.title;
    if (dto.bio !== undefined) profileUpdate.bio = dto.bio;
    if (dto.hourlyRate !== undefined) profileUpdate.hourly_rate = dto.hourlyRate;
    if (dto.location !== undefined) profileUpdate.location = dto.location;
    if (dto.experienceYears !== undefined) profileUpdate.experience_years = dto.experienceYears;

    await supabase.from('freelancer_profiles').update(profileUpdate).eq('id', freelancerProfileId);

    if (dto.skills && Array.isArray(dto.skills)) {
      await supabase
        .from('freelancer_skills')
        .delete()
        .eq('freelancer_id', freelancerProfileId);

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
          await supabase.from('freelancer_skills').insert({
            freelancer_id: freelancerProfileId,
            skill_id: skill.id,
          });
        }
      }
    }

    return await this.getProfile(userId);
  }

  static async addPortfolioItem(userId: string, dto: AddPortfolioItemDTO) {
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
      throw new AppError('Freelancer profile not found', 404);
    }

    const { data: item, error } = await supabase
      .from('portfolio_projects')
      .insert({
        freelancer_id: fp.id,
        title: dto.title.trim(),
        description: dto.description.trim(),
        project_url: dto.projectUrl,
        image_url: dto.imageUrl,
      })
      .select('*')
      .single();

    if (error || !item) {
      throw new AppError(`Failed to add portfolio item: ${error?.message}`, 500);
    }

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      projectUrl: item.project_url,
      imageUrl: item.image_url,
      createdAt: item.created_at,
    };
  }

  static async deletePortfolioItem(userId: string, itemId: string) {
    const { data: item } = await supabase
      .from('portfolio_projects')
      .select('id, freelancer_profiles (user_id)')
      .eq('id', itemId)
      .maybeSingle();

    if (!item) {
      throw new AppError('Portfolio item not found', 404);
    }

    const fp = Array.isArray(item.freelancer_profiles)
      ? item.freelancer_profiles[0]
      : item.freelancer_profiles;

    if (!fp || fp.user_id !== userId) {
      throw new AppError('Unauthorized to delete this portfolio item', 403);
    }

    await supabase.from('portfolio_projects').delete().eq('id', itemId);
    return { message: 'Portfolio item deleted successfully' };
  }

  static async listFreelancers(query: { skill?: string; search?: string }) {
    const { data: freelancers, error } = await supabase
      .from('freelancer_profiles')
      .select(`
        id,
        title,
        bio,
        hourly_rate,
        experience_years,
        location,
        created_at,
        users (id, email, full_name, avatar_url),
        freelancer_skills (skills (id, name)),
        portfolio_projects (id, title, description, project_url, image_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(`Failed to list freelancers: ${error.message}`, 500);
    }

    let results = (freelancers || []).map((f: any) => {
      const u = Array.isArray(f.users) ? f.users[0] : f.users;
      const skills = (f.freelancer_skills || []).map((fs: any) => ({
        skill: { id: fs.skills?.id, name: fs.skills?.name },
      }));

      return {
        id: f.id,
        title: f.title,
        bio: f.bio,
        hourlyRate: f.hourly_rate,
        experienceYears: f.experience_years,
        location: f.location,
        createdAt: f.created_at,
        user: u
          ? {
              id: u.id,
              email: u.email,
              fullName: u.full_name,
              avatarUrl: u.avatar_url,
            }
          : null,
        skills,
        portfolioProjects: f.portfolio_projects || [],
      };
    });

    if (query.skill) {
      const sFilter = query.skill.toLowerCase();
      results = results.filter((f) =>
        f.skills.some((s: any) => s.skill?.name?.toLowerCase().includes(sFilter))
      );
    }

    if (query.search) {
      const q = query.search.toLowerCase();
      results = results.filter(
        (f) =>
          (f.title && f.title.toLowerCase().includes(q)) ||
          (f.bio && f.bio.toLowerCase().includes(q)) ||
          (f.user?.fullName && f.user.fullName.toLowerCase().includes(q))
      );
    }

    return results;
  }
}
