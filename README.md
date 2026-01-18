# 🎬 Screen Recording & Video Trimmer - Next.js + TypeScript

A modern full-stack application built with **Next.js 15** and **TypeScript** to record your screen, trim videos, and upload them to cloud storage with MongoDB metadata storage.

## ✨ Features

- 📹 **Screen Recording** - Record any window with audio
- ✂️ **Video Trimming** - Precise start/end time selection  
- ☁️ **Cloud Storage** - Cloudinary integration
- 💾 **Database** - MongoDB for metadata
- 🎨 **Modern UI** - Beautiful, responsive design
- 📱 **Mobile Friendly** - Works on all devices
- ⚡ **Real-time Updates** - Auto-refreshing video list
- 📥 **Download** - Direct download links
- 🗑️ **Delete** - Remove videos anytime
- 📊 **Analytics** - Track views and statistics

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 (React 19)
- TypeScript
- Modern CSS with Flexbox/Grid

**Backend:**
- Next.js API Routes
- Node.js with TypeScript
- MongoDB for database
- FFmpeg for video processing
- Cloudinary for storage
- Multer for file uploads

## 📦 Prerequisites

- **Node.js** v18+
- **MongoDB** (local or cloud)
- **FFmpeg** (for video processing)
- **Cloudinary Account** (free tier available)

### Install FFmpeg

**Windows (Chocolatey):**
```bash
choco install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install ffmpeg
```

**Linux (Fedora):**
```bash
sudo dnf install ffmpeg
```

## 🚀 Getting Started

### 1. Clone or Extract Project
```bash
cd nextjs-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file:
```bash
cp .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/video-trimmer
# OR use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/video-trimmer

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3000
```

### 4. Get Cloudinary Credentials
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard → Settings
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to `.env.local`

### 5. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env.local`

### 6. Create Uploads Directory
```bash
mkdir -p public/uploads
```

### 7. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── videos/
│   │   │       ├── route.ts              # GET /api/videos, POST /api/videos/upload
│   │   │       ├── [id]/
│   │   │       │   ├── route.ts          # GET, PATCH, DELETE single video
│   │   │       │   ├── view/route.ts     # POST track view
│   │   │       │   └── analytics/route.ts # GET video analytics
│   │   │       └── analytics/all/route.ts # GET all analytics
│   │   ├── layout.tsx                    # Root layout
│   │   └── page.tsx                      # Home page
│   ├── components/
│   │   └── ScreenRecorder.tsx            # Main component
│   ├── lib/
│   │   ├── db.ts                         # MongoDB connection
│   │   ├── ffmpeg.ts                     # FFmpeg utilities
│   │   └── cloudinary.ts                 # Cloudinary upload
│   ├── models/
│   │   └── Video.ts                      # Video schema
│   └── styles/
│       ├── globals.css
│       └── App.css
├── public/
│   └── uploads/                          # Temporary upload storage
├── .env.local                            # Environment variables
├── next.config.js
├── tsconfig.json
└── package.json
```

## 🔌 API Endpoints

### Videos
- `GET /api/videos` - Get all videos
- `POST /api/videos/upload` - Upload and trim video
- `GET /api/videos/:id` - Get single video
- `PATCH /api/videos/:id` - Update video metadata
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/:id/view` - Track video view
- `GET /api/videos/:id/analytics` - Get video analytics
- `GET /api/videos/analytics/all` - Get all analytics

## 🎯 Usage

### Recording a Video
1. Click **"Start Recording"**
2. Select screen/window and audio source
3. Click **"Stop Recording"** when done
4. Preview video, set title and description
5. Adjust trim start/end times (optional)
6. Click **"Trim & Upload"** to process and upload

### Viewing Videos
- Videos auto-update in the **"Uploaded Videos"** section
- Click **"Download"** to get the trimmed video
- Click **"Analytics"** to view statistics
- Click **"Delete"** to remove the video

### Viewing Analytics
- Click **"📊 Analytics"** in header for all videos
- Click **"📊 Analytics"** on individual videos for details

## 🔧 Build & Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

**Note:** This app uses server-side file operations. Choose platforms that support:
- Node.js runtime
- File system access
- Long-running processes for video processing

Recommended:
- **Vercel** (with limitations on processing time)
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- **AWS EC2**
- **Self-hosted VPS**

## 🐛 Troubleshooting

**"FFmpeg not found"**
- Ensure FFmpeg is installed: `ffmpeg -version`
- On Windows, add FFmpeg to PATH or specify path in `src/lib/ffmpeg.ts`

**"MongoDB connection error"**
- Ensure MongoDB is running
- Check `MONGODB_URI` is correct
- For Atlas, whitelist your IP address

**"Cloudinary upload fails"**
- Verify credentials in `.env.local`
- Check Cloudinary account is active
- Ensure upload settings allow video uploads

**"Recording fails on certain browsers"**
- Use Chrome, Edge, or Firefox
- Safari has limited getDisplayMedia support
- Check screen sharing permissions in browser settings

## 📝 Migration from Original Project

This is a complete rewrite from the original Vite + Express setup:
- **Frontend**: Migrated from Vite + React to Next.js 15 (React 19)
- **Backend**: Migrated from Express routes to Next.js API routes
- **Language**: Added TypeScript throughout
- **Database**: Same MongoDB setup, improved schemas with TypeScript
- **All functionality preserved**: Recording, trimming, uploading, analytics

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed changes.

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [FFmpeg Docs](https://ffmpeg.org/documentation.html)

## 📄 License

ISC

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 💡 Tips

- Use `npm run lint` to check code quality
- Use `npm run type-check` for TypeScript validation
- Keep FFmpeg processing time under 30s for Vercel (upgrade to Pro for longer)
- Monitor Cloudinary usage (free tier has limits)
- Regular database backups recommended for production

---

Made with ❤️ using Next.js + TypeScript
