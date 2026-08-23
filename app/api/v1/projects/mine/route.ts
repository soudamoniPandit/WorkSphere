import { NextRequest } from 'next/server';
import { ProjectController } from '@/lib/server/controllers/project.controller';

export async function GET(req: NextRequest) {
  return ProjectController.getMyProjects(req);
}
