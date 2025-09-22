#!/bin/bash
# Build script for frontend deployment

echo "Starting frontend build process..."

# Navigate to client directory
cd client

# Install dependencies
echo "Installing dependencies..."
npm ci

# Verify public directory exists
echo "Checking for public directory..."
if [ ! -f "public/index.html" ]; then
    echo "ERROR: public/index.html not found!"
    echo "Current directory: $(pwd)"
    echo "Contents of current directory:"
    ls -la
    echo "Contents of public directory:"
    ls -la public/ || echo "Public directory not found!"
    exit 1
fi

echo "public/index.html found, proceeding with build..."

# Build the React app
echo "Building React app..."
npm run build

echo "Build completed successfully!"
