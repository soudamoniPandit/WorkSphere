import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/lib/server/services/profile.service';
import { getAuthUser, AppError } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const profile = await ProfileService.getProfile(user.userId);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: statusCode }
    );
  }
}
