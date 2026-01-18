import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const video = await Video.findById(params.id);

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
        analytics: {
          id: video._id,
          title: video.title,
          views: video.views,
          duration: video.duration,
          fileSize: video.fileSize,
          status: video.status,
          createdAt: video.createdAt,
          lastViewed: video.lastViewed,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message ?? 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

