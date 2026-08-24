// ==========================================
// Database Enums & Types for Supabase
// ==========================================

export enum Role {
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER',
  ADMIN = 'ADMIN',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ProposalStatus {
  PENDING = 'PENDING',
  SHORTLISTED = 'SHORTLISTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum MilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
}

export interface UserRow {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: Role;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientProfileRow {
  id: string;
  user_id: string;
  company_name?: string | null;
  company_website?: string | null;
  description?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FreelancerProfileRow {
  id: string;
  user_id: string;
  title?: string | null;
  bio?: string | null;
  hourly_rate?: number | null;
  experience_years?: number | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  client_id: string;
  title: string;
  description: string;
  budget: number;
  deadline?: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProposalRow {
  id: string;
  project_id: string;
  freelancer_id: string;
  cover_letter: string;
  proposed_price: number;
  estimated_days: number;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}

export interface ConversationRow {
  id: string;
  project_id: string;
  client_id: string;
  freelancer_id: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  project_id: string;
  author_id: string;
  target_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface PortfolioProjectRow {
  id: string;
  freelancer_id: string;
  title: string;
  description: string;
  project_url?: string | null;
  image_url?: string | null;
  created_at: string;
}
