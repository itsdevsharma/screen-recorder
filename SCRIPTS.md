# NPM Scripts Reference

This document explains all available npm scripts in the project.

## Development Scripts

### `npm run dev`
Starts the Next.js development server with hot module reloading.

```bash
npm run dev
```

- Opens: `http://localhost:3000`
- Auto-reloads on file changes
- Shows TypeScript errors in terminal
- Includes ESLint warnings

**Use this during development.**

---

## Production Scripts

### `npm run build`
Creates an optimized production build.

```bash
npm run build
```

- Compiles TypeScript
- Optimizes code and bundles
- Generates `.next` folder
- Shows any build errors
- Takes 1-3 minutes typically

**Run this before deployment.**

### `npm start`
Starts the production server (requires `npm run build` first).

```bash
npm start
```

- Runs the production build
- Production optimizations enabled
- No hot reloading
- Ready for deployment

**Use this to test production locally.**

---

## Code Quality Scripts

### `npm run lint`
Checks code quality with ESLint.

```bash
npm run lint
```

- Checks TypeScript and JavaScript files
- Checks React best practices
- Shows warnings and errors
- Suggests fixes

**Run before committing code.**

### `npm run type-check`
Validates TypeScript types without building.

```bash
npm run type-check
```

- Checks type safety
- Finds potential TypeScript errors
- Faster than full build
- No output = all types correct

**Use to debug TypeScript issues.**

---

## Combined Development Workflow

```bash
# Initial setup
npm install

# During development
npm run dev        # In terminal 1 - live server
npm run type-check # In terminal 2 - TypeScript errors
npm run lint       # Check before committing

# Before pushing
npm run build      # Test production build
npm run lint       # Final code check

# Deploy
npm start          # Run production build
```

---

## Environment Setup Scripts

### Creating environment file
```bash
cp .env.local.example .env.local
```

### Creating uploads directory
```bash
mkdir -p public/uploads
```

---

## Common Issues & Solutions

### Dev server won't start
```bash
# Clear cache and restart
rm -rf .next node_modules
npm install
npm run dev
```

### TypeScript errors showing in IDE but build succeeds
```bash
npm run type-check
```

### Port 3000 already in use
```bash
# Use different port
PORT=3001 npm run dev
```

### Need to rebuild everything
```bash
rm -rf .next
npm run build
npm start
```

---

## Performance Tips

- Use `npm run dev` for development (fastest)
- Use `npm run build` to test production locally
- Use `npm run type-check` to check types only (faster than build)
- Use `npm run lint` to check code quality

---

## CI/CD Pipeline Example

```bash
#!/bin/bash

# Install dependencies
npm install

# Check code quality
npm run lint

# Validate types
npm run type-check

# Build for production
npm run build

# Run production server
npm start
```

---

## Script Details

Each script in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",              // Development server with HMR
    "build": "next build",          // Production build
    "start": "next start",          // Production server
    "lint": "next lint",            // ESLint with Next.js rules
    "type-check": "tsc --noEmit"    // TypeScript checking only
  }
}
```

---

## Deployment Scripts

### For Vercel
```bash
npm install
npm run build
# Deploy automatically
```

### For Other Platforms
```bash
npm install
npm run build
npm start
```

### With Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Monitoring & Debugging

### Check what changed recently
```bash
npm run lint     # Code quality
npm run type-check  # Types
```

### Debug slow build
```bash
ANALYZE=true npm run build
```

### Debug runtime issues
```bash
npm run dev
# Check browser console for errors
# Check terminal for server errors
```

---

**Happy coding!** 🚀
