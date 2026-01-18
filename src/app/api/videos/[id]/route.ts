import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = await params;
    const video = await Video.findById(id);

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
        video,
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

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
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
        message: 'Video updated successfully',
        video,
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

export const DELETE = async (
  /*req: NextRequest,*/
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();
    const { id } = await params;
    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return NextResponse.json(
        {
          success: false,
          message: 'Video not found',
        },
        { status: 404 }
      );
    }

    // Delete from Cloudinary if exists
    if (video.cloudinaryId) {
      await deleteFromCloudinary(video.cloudinaryId).catch(() => {});
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Video deleted successfully',
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
