#!/bin/bash
echo "=== Frontend Build Script ==="

# Check current directory structure
echo "Current directory: $(pwd)"
echo "Contents:"
ls -la

# Create src directory if it doesn't exist
if [ ! -d "src" ]; then
    echo "Creating src directory..."
    mkdir -p src
fi

# Copy client directory to src/client
echo "Copying client to src/client..."
cp -r client src/client

# Verify the structure
echo "Verifying structure:"
echo "client/public contents:"
ls -la client/public/ || echo "client/public not found"
echo "src/client/public contents:"
ls -la src/client/public/ || echo "src/client/public not found"

# Navigate to client directory and build
echo "Building React app..."
cd client
npm install
npm run build

echo "Build completed!"
