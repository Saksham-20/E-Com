#!/bin/bash
echo "=== Fixing Path Issues ==="

# Check current directory structure
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

# Check if src directory exists and create it if needed
if [ ! -d "src" ]; then
    echo "Creating src directory..."
    mkdir -p src
fi

# Check if client directory exists
if [ -d "client" ]; then
    echo "client directory exists"
    
    # Create symbolic link from src/client to client
    if [ ! -L "src/client" ]; then
        echo "Creating symbolic link from src/client to client..."
        ln -s ../client src/client
    fi
    
    # Verify the link works
    echo "Verifying symbolic link:"
    ls -la src/
    ls -la src/client/
    ls -la src/client/public/
    
    # Also try copying the files
    echo "Copying client directory to src/client as backup..."
    cp -r client src/client_backup
    
    echo "Contents of src/client_backup/public:"
    ls -la src/client_backup/public/
    
else
    echo "client directory does NOT exist!"
    exit 1
fi

echo "=== Path fix completed ==="
