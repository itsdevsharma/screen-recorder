import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();
    const video = await Video.findByIdAndUpdate(
      params.id,
      {
        $inc: { views: 1 },
        lastViewed: new Date(),
      },
      { new: true }
    );

    if (!video) {
      return NextResponse.json(
        {
          success: false,
          message: 'Video not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'View tracked successfully',
        views: video.views,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
};
