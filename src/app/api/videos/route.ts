import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const videos = await Video.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: videos.length,
        videos,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Error fetching videos',
      },
      { status: 500 }
    );
  }
};
