import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description?: string;
  originalUrl: string;
  trimmedUrl?: string;
  cloudinaryId?: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  views: number;
  lastViewed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>({
  title: {
    type: String,
    required: true,
  },
  description: String,
  originalUrl: {
    type: String,
    required: true,
  },
  trimmedUrl: String,
  cloudinaryId: String,
  duration: Number,
  trimStart: Number,
  trimEnd: Number,
  fileSize: Number,
  mimeType: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  views: {
    type: Number,
    default: 0,
  },
  lastViewed: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Video || mongoose.model<IVideo>('Video', videoSchema);
