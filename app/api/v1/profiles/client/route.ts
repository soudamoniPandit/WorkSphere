import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/lib/server/services/profile.service';
import { getAuthUser, requireRole, AppError } from '@/lib/server/auth';
import { Role } from '@prisma/client';

export async function PUT(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    requireRole(user, [Role.CLIENT]);

    const body = await req.json();
    const updatedProfile = await ProfileService.updateClientProfile(user.userId, body);

    return NextResponse.json({
      success: true,
      message: 'Client profile updated successfully',
      data: updatedProfile,
    });
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: statusCode }
    );
  }
}
