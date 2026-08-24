import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/lib/server/services/profile.service';
import { getAuthUser, requireRole, AppError } from '@/lib/server/auth';
import { Role } from '@/types/database';


export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    requireRole(user, [Role.FREELANCER]);

    const body = await req.json();
    const { title, description, projectUrl, imageUrl } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Title and description are required for portfolio items' },
        { status: 400 }
      );
    }

    const item = await ProfileService.addPortfolioItem(user.userId, {
      title,
      description,
      projectUrl,
      imageUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Portfolio item added successfully',
        data: item,
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
