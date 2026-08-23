import { NextRequest } from 'next/server';
import { ProjectController } from '@/lib/server/controllers/project.controller';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return ProjectController.getProjectById(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return ProjectController.updateProject(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return ProjectController.deleteProject(req, params);
}
