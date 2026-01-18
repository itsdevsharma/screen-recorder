import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import { trimVideo, getVideoDuration, deleteFile } from '@/lib/ffmpeg';
import { uploadToCloudinary } from '@/lib/cloudinary';

const uploadsDir = join(process.cwd(), 'public', 'uploads');

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const trimStart = parseFloat(formData.get('trimStart') as string);
    const trimEnd = parseFloat(formData.get('trimEnd') as string);

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (trimStart === undefined || trimEnd === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: 'Trim start and end times are required',
        },
        { status: 400 }
      );
    }

    if (trimStart >= trimEnd) {
      return NextResponse.json(
        {
          success: false,
          message: 'Trim start time must be less than end time',
        },
        { status: 400 }
      );
    }

    // Save uploaded file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `upload-${Date.now()}.mp4`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    // Get video duration
    const duration = await getVideoDuration(filePath);

    if (trimEnd > duration) {
      await deleteFile(filePath);
      return NextResponse.json(
        {
          success: false,
          message: `Trim end time exceeds video duration (${duration}s)`,
        },
        { status: 400 }
      );
    }

    // Create video record
    const video = new Video({
      title: title || file.name,
      description,
      originalUrl: filePath,
      duration,
      trimStart,
      trimEnd,
      fileSize: file.size,
      mimeType: file.type,
      status: 'processing',
    });

    await video.save();

    // Trim video
    const trimmedFileName = `trimmed-${Date.now()}.mp4`;
    const trimmedPath = join(uploadsDir, trimmedFileName);

    await trimVideo(filePath, trimmedPath, trimStart, trimEnd);

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      trimmedPath,
      `trimmed-${video._id}`
    );

    // Update video record
    video.trimmedUrl = cloudinaryResult.secure_url;
    video.cloudinaryId = cloudinaryResult.public_id;
    video.status = 'completed';
    await video.save();

    // Clean up local files
    await deleteFile(filePath).catch(() => {});
    await deleteFile(trimmedPath).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        message: 'Video trimmed and uploaded successfully',
        video,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Error processing video',
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
};
