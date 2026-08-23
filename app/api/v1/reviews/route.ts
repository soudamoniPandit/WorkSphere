import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/server/services/review.service';
import { getAuthUser, AppError } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const body = await req.json();

    const review = await ReviewService.createReview(user.userId, {
      projectId: body.projectId,
      rating: body.rating,
      comment: body.comment,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Review and feedback submitted successfully',
        data: review,
      },
      { status: 201 }
    );
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to submit review' },
      { status: statusCode }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'projectId query parameter is required' },
        { status: 400 }
      );
    }

    const reviews = await ReviewService.getProjectReviews(projectId);

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch reviews' },
      { status: statusCode }
    );
  }
}
