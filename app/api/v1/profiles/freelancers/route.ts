import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/lib/server/services/profile.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skill = searchParams.get('skill') || undefined;
    const search = searchParams.get('search') || undefined;

    const freelancers = await ProfileService.listFreelancers({ skill, search });

    return NextResponse.json({
      success: true,
      data: freelancers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
