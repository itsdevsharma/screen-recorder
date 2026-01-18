import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import { deleteFromCloudinary } from '@/lib/cloudinary';

/**
 * GET /api/videos/[id]
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const video = await Video.findById(id);

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, video },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/videos/[id]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { title, description } = await req.json();

    const video = await Video.findByIdAndUpdate(
      params.id,
      { title, description, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Video updated successfully',
        video,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/videos/[id]
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    if (video.cloudinaryId) {
      await deleteFromCloudinary(video.cloudinaryId).catch(() => {});
    }

    return NextResponse.json(
      { success: true, message: 'Video deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
