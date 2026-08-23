import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/server/services/auth.service';
import { AppError } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await AuthService.login({ email, password });

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: statusCode }
    );
  }
}
