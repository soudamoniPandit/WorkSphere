import { NextRequest } from 'next/server';
import { ProjectController } from '@/lib/server/controllers/project.controller';

export async function GET(req: NextRequest) {
  return ProjectController.getProjects(req);
}

export async function POST(req: NextRequest) {
  return ProjectController.createProject(req);
}
