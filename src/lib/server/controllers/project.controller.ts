import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '../services/project.service';
import { getAuthUser, requireRole, AppError } from '../auth';
import { Role, ProjectStatus } from '@/types/database';


export class ProjectController {
  static async createProject(req: NextRequest) {
    try {
      const user = getAuthUser(req);
      requireRole(user, [Role.CLIENT]);

      const body = await req.json();
      const { title, description, budget, deadline, skills } = body;

      if (!title || !description || budget === undefined || !skills || !Array.isArray(skills)) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields: title, description, budget, skills' },
          { status: 400 }
        );
      }

      const project = await ProjectService.createProject(user.userId, {
        title,
        description,
        budget: Number(budget),
        deadline,
        skills,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Project posted successfully',
          data: project,
        },
        { status: 201 }
      );
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }

  static async getProjects(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);

      const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;
      const status = (searchParams.get('status') as ProjectStatus) || undefined;
      const skill = searchParams.get('skill') || undefined;
      const search = searchParams.get('search') || undefined;
      const minBudget = searchParams.get('minBudget') ? parseFloat(searchParams.get('minBudget')!) : undefined;
      const maxBudget = searchParams.get('maxBudget') ? parseFloat(searchParams.get('maxBudget')!) : undefined;

      const result = await ProjectService.getProjects({
        page,
        limit,
        status,
        skill,
        search,
        minBudget,
        maxBudget,
      });

      return NextResponse.json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: 500 }
      );
    }
  }

  static async getProjectById(_req: NextRequest, params: { id: string }) {
    try {
      const project = await ProjectService.getProjectById(params.id);

      return NextResponse.json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }

  static async updateProject(req: NextRequest, params: { id: string }) {
    try {
      const user = getAuthUser(req);
      requireRole(user, [Role.CLIENT]);

      const body = await req.json();
      const updatedProject = await ProjectService.updateProject(user.userId, params.id, body);

      return NextResponse.json({
        success: true,
        message: 'Project updated successfully',
        data: updatedProject,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }

  static async deleteProject(req: NextRequest, params: { id: string }) {
    try {
      const user = getAuthUser(req);
      requireRole(user, [Role.CLIENT]);

      const result = await ProjectService.deleteProject(user.userId, params.id);

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }

  static async getMyProjects(req: NextRequest) {
    try {
      const user = getAuthUser(req);
      requireRole(user, [Role.CLIENT]);

      const projects = await ProjectService.getClientProjects(user.userId);

      return NextResponse.json({
        success: true,
        data: projects,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }

  static async getDashboardStats(req: NextRequest) {
    try {
      const user = getAuthUser(req);
      const stats = await ProjectService.getDashboardStats(user.userId, user.role);

      return NextResponse.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return NextResponse.json(
        { success: false, message: error.message || 'Internal Server Error' },
        { status: statusCode }
      );
    }
  }
}

