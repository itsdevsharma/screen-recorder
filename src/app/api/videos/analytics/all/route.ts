import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const videos = await Video.find().select(
      'title views duration fileSize status createdAt lastViewed'
    );

    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const totalVideos = videos.length;
    const sortedVideos = [...videos].sort((a, b) => b.views - a.views);
    const mostViewed = sortedVideos[0];

    return NextResponse.json(
      {
        success: true,
        summary: {
          totalVideos,
          totalViews,
          mostViewedVideo: mostViewed
            ? {
                title: mostViewed.title,
                views: mostViewed.views,
              }
            : null,
        },
        videos: videos.map((video) => ({
          id: video._id,
          title: video.title,
          views: video.views,
          duration: video.duration,
          fileSize: video.fileSize,
          createdAt: video.createdAt,
          lastViewed: video.lastViewed,
        })),
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
