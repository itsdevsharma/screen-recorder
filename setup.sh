#!/bin/bash

# Screen Recorder - Next.js + TypeScript Setup Script
# This script sets up the project for first-time use

set -e

echo "================================"
echo "🎬 Screen Recorder Setup"
echo "================================"
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org"
    exit 1
fi
echo "✓ Node.js $(node --version) found"
echo ""

# Check npm
echo "✓ Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi
echo "✓ npm $(npm --version) found"
echo ""

# Check FFmpeg
echo "✓ Checking FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg is not installed. It's required for video processing."
    echo ""
    echo "Install FFmpeg:"
    echo "  Windows (Chocolatey): choco install ffmpeg"
    echo "  Mac (Homebrew):       brew install ffmpeg"
    echo "  Linux (Ubuntu):       sudo apt-get install ffmpeg"
    echo ""
    echo "After installing FFmpeg, run this script again."
    exit 1
fi
echo "✓ FFmpeg found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p public/uploads
echo "✓ Uploads directory created"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📋 Creating .env.local..."
    if [ -f .env.local.example ]; then
        cp .env.local.example .env.local
        echo "✓ .env.local created from .env.local.example"
        echo ""
        echo "⚠️  IMPORTANT: Edit .env.local with your configuration:"
        echo "   - MONGODB_URI"
        echo "   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
        echo "   - CLOUDINARY_API_KEY"
        echo "   - CLOUDINARY_API_SECRET"
    else
        echo "❌ .env.local.example not found"
        exit 1
    fi
else
    echo "✓ .env.local already exists"
fi
echo ""

# Summary
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "Make sure MongoDB is running and Cloudinary credentials are set!"
echo ""
