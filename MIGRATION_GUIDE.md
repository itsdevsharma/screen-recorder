# Migration Guide: Vite + Express → Next.js + TypeScript

This guide documents the migration from the original Vite + Express architecture to Next.js 15 + TypeScript.

## Overview of Changes

### Architecture Changes

**Before (Vite + Express):**
```
Frontend (Vite)          Backend (Express)
├── React 19            ├── Node.js
├── JavaScript          ├── JavaScript
└── Separate Server     ├── MongoDB
                        ├── Cloudinary
                        └── FFmpeg
```

**After (Next.js):**
```
Next.js 15 Full-Stack
├── Frontend (React 19)
├── API Routes (Node.js)
├── TypeScript Throughout
├── MongoDB
├── Cloudinary
└── FFmpeg
```

## Key Changes

### 1. Frontend Migration

**Vite + React (Before):**
```
screen-recording/
├── src/
│   ├── App.jsx           # Main component
│   ├── main.jsx          # Entry point
│   └── App.css
├── vite.config.js
└── package.json
```

**Next.js (After):**
```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/
│   │   └── ScreenRecorder.tsx  # Main component (migrated)
│   └── styles/
│       └── App.css       # Styles (same)
├── next.config.js
└── package.json
```

### 2. Backend Integration

**Express Routes (Before):**
```javascript
// backend/src/router/videoRouter.js
router.post('/upload', upload.single('video'), videoController.uploadAndTrimVideo);
router.get('/', videoController.getAllVideos);
router.delete('/:id', videoController.deleteVideo);
```

**Next.js API Routes (After):**
```typescript
// src/app/api/videos/route.ts (same endpoint, now integrated)
export const GET = async (req: NextRequest) => { ... }
export const POST = async (req: NextRequest) => { ... }

// src/app/api/videos/[id]/route.ts
export const DELETE = async (req: NextRequest, { params }) => { ... }
```

### 3. File Organization

| File | Before | After |
|------|--------|-------|
| Database Connection | `backend/src/config/database.js` | `src/lib/db.ts` |
| Models | `backend/src/models/Video.js` | `src/models/Video.ts` |
| Cloudinary Utils | `backend/src/utils/cloudinaryUpload.js` | `src/lib/cloudinary.ts` |
| FFmpeg Utils | `backend/src/utils/ffmpeg.js` | `src/lib/ffmpeg.ts` |
| Controllers | `backend/src/controllers/videoController.js` | `src/app/api/videos/*/route.ts` |
| Main Component | `screen-recording/src/App.jsx` | `src/components/ScreenRecorder.tsx` |

### 4. Type Safety

**Before (JavaScript):**
```javascript
// Could cause runtime errors
const video = { title: req.body.title };
if (trimStart === undefined) { ... }
```

**After (TypeScript):**
```typescript
// Type-safe, caught at compile time
interface Video {
  title: string;
  description?: string;
  // ... other properties
}

const video: Video = { title: formData.get('title') as string };
if (trimStart === undefined) { ... }
```

### 5. Configuration

**Vite Config (Before):**
```javascript
// vite.config.js
export default {
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5000' } }
}
```

**Next.js Config (After):**
```javascript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'cloudinary']
  }
};
```

### 6. Environment Variables

**Before:**
```env
# .env files in frontend and backend
VITE_API_URL=http://localhost:5000/api
MONGODB_URI=mongodb://localhost:27017/video-trimmer
```

**After:**
```env
# .env.local (single file for Next.js)
MONGODB_URI=mongodb://localhost:27017/video-trimmer
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Component Changes

### App Component Migration

**Before (React + Vite):**
```jsx
export default function ScreenRecorder() {
  const [recording, setRecording] = useState(false);
  // ... state management
  const response = await fetch(`${API_BASE_URL}/videos/upload`, {
    method: "POST",
    body: formData,
  });
}
```

**After (Next.js + TypeScript):**
```typescript
'use client';

interface Video {
  _id: string;
  title: string;
  // ... properties with types
}

export default function ScreenRecorder() {
  const [recording, setRecording] = useState(false);
  // ... same state with types
  const response = await fetch(`${API_BASE_URL}/videos/upload`, {
    method: 'POST',
    body: formData,
  });
}
```

Key differences:
- `'use client'` directive for client-side interactivity
- TypeScript interfaces for all data structures
- Same functionality, better type safety

## API Changes

### Request/Response Handling

**Express (Before):**
```javascript
exports.uploadAndTrimVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file' });
  }
  // ... process
  res.json({ success: true, video });
}
```

**Next.js (After):**
```typescript
export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get('video') as File;
  if (!file) {
    return NextResponse.json(
      { success: false, message: 'No file' },
      { status: 400 }
    );
  }
  // ... process
  return NextResponse.json({ success: true, video }, { status: 201 });
}
```

## Database Connection

**Before (Separate Backend):**
```javascript
// backend/src/config/database.js
const connectDB = async () => {
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};
```

**After (Integrated with Next.js):**
```typescript
// src/lib/db.ts - With connection caching for serverless
let cached = global.mongoose;

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

## Performance Optimizations

1. **Connection Pooling**: MongoDB connection cached in Next.js serverless environment
2. **File Uploads**: Handled directly in API routes without extra server
3. **Streaming**: Next.js handles streaming responses better
4. **Compression**: Automatic with Next.js deployment

## Running Both Versions

You can keep both versions temporarily during migration:

```bash
# Development
# Terminal 1: Next.js version
cd nextjs-app && npm run dev

# Terminal 2: Original (optional, for comparison)
cd backend && npm run dev
cd screen-recording && npm run dev
```

## Deployment Considerations

### Before (Two Separate Deployments)
- Frontend deployment (Vercel, Netlify)
- Backend deployment (Heroku, Railway, etc.)
- CORS configuration needed

### After (Single Deployment)
- Deploy to single host
- Backend and frontend together
- No CORS issues
- Environment variables in one place
- Easier to manage

## Checklist for Complete Migration

- [x] Frontend migrated from Vite to Next.js
- [x] React component converted to TypeScript
- [x] Express routes converted to Next.js API routes
- [x] Database utilities migrated
- [x] Cloudinary utilities migrated
- [x] FFmpeg utilities migrated
- [x] Models converted to TypeScript
- [x] Environment configuration unified
- [x] CSS styles preserved
- [x] All features maintained
- [x] TypeScript strict mode enabled

## Rollback Plan

If needed to revert:

1. Keep original code in `backend/` and `screen-recording/` folders
2. The new code is in `nextjs-app/` folder
3. Simply use the old versions if issues arise
4. No data loss as database is separate

## Testing the Migration

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your values

# 3. Create uploads directory
mkdir -p public/uploads

# 4. Start dev server
npm run dev

# 5. Test in browser
# - Start recording
# - Stop and trim
# - Upload
# - View in list
# - Check analytics
# - Delete video
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS error | Frontend/backend separation | Automatically resolved in Next.js |
| `fetch is not defined` | Server-side code | Import from Node.js or use `next/fetch` |
| DB connection timeout | Connection not cached | Ensure `db.ts` connection caching works |
| FFmpeg not found | Missing installation | Install: `choco install ffmpeg` (Windows) |
| Uploads failing | Missing uploads directory | Create: `mkdir -p public/uploads` |

## Next Steps

1. ✅ Complete the migration (done)
2. Deploy to production
3. Run parallel testing with both versions
4. Migrate data if needed
5. Switch users to Next.js version
6. Archive old backend code
7. Monitor performance and logs

---

**Migration completed successfully!** The project is now fully integrated with Next.js + TypeScript.
