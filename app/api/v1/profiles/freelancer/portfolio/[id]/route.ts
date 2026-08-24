import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/lib/server/services/profile.service';
import { getAuthUser, requireRole, AppError } from '@/lib/server/auth';
import { Role } from '@/types/database';


export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(req);
    requireRole(user, [Role.FREELANCER]);

    const itemId = params.id;
    const result = await ProfileService.deletePortfolioItem(user.userId, itemId);

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
