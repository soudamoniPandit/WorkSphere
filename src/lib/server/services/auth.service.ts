import { supabase } from '../supabase';
import { hashPassword, comparePassword } from '../password';
import { generateToken } from '../jwt';
import { AppError } from '../auth';
import { Role } from '@/types/database';


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
    const email = dto.email.toLowerCase().trim();

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      throw new AppError(`Database query failed: ${checkError.message}`, 500);
    }

    if (existingUser) {
      throw new AppError('An account with this email already exists.', 400);
    }

    const hashedPassword = await hashPassword(dto.password);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        full_name: dto.fullName.trim(),
        role: dto.role,
      })
      .select('id, email, full_name, role, avatar_url, created_at')
      .single();

    if (userError || !user) {
      throw new AppError(`Failed to create account: ${userError?.message}`, 500);
    }

    // Create profile
    if (dto.role === Role.CLIENT) {
      await supabase.from('client_profiles').insert({ user_id: user.id });
    } else if (dto.role === Role.FREELANCER) {
      await supabase.from('freelancer_profiles').insert({ user_id: user.id });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
    };

    return {
      user: sanitizedUser,
      token,
    };
  }

  static async login(dto: LoginDTO) {
    const email = dto.email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password, full_name, role, avatar_url, created_at')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new AppError(`Database query failed: ${error.message}`, 500);
    }

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
      role: user.role as Role,
    });

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
    };

    return {
      user: sanitizedUser,
      token,
    };
  }

  static async getCurrentUser(userId: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        avatar_url,
        created_at,
        client_profiles (id, company_name, company_website, description, location),
        freelancer_profiles (
          id,
          title,
          bio,
          hourly_rate,
          experience_years,
          location,
          freelancer_skills (
            skills (id, name)
          )
        )
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new AppError(`Failed to fetch user: ${error.message}`, 500);
    }

    if (!user) {
      throw new AppError('User account not found.', 404);
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
        skill: {
          id: fs.skills?.id,
          name: fs.skills?.name,
        },
      }));

      freelancerProfile = {
        id: rawFreelancer.id,
        title: rawFreelancer.title,
        bio: rawFreelancer.bio,
        hourlyRate: rawFreelancer.hourly_rate,
        experienceYears: rawFreelancer.experience_years,
        location: rawFreelancer.location,
        skills,
      };
    }

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
    };
  }
}
