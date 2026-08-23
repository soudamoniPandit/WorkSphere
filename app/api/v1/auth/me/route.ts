import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/server/services/auth.service';
import { getAuthUser, AppError } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const currentUser = await AuthService.getCurrentUser(user.userId);

    return NextResponse.json({
      success: true,
      data: currentUser,
    });
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: statusCode }
    );
  }
}
