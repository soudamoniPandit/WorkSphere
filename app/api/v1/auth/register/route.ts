import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/server/services/auth.service';
import { AppError } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, role } = body;

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: email, password, fullName, role' },
        { status: 400 }
      );
    }

    const result = await AuthService.register({ email, password, fullName, role });

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully',
        data: result,
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
