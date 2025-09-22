#!/bin/bash
echo "=== Debug Build Script ==="
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

echo ""
echo "Checking for client directory:"
if [ -d "client" ]; then
    echo "client directory exists"
    echo "Contents of client directory:"
    ls -la client/
    
    echo ""
    echo "Checking for client/public directory:"
    if [ -d "client/public" ]; then
        echo "client/public directory exists"
        echo "Contents of client/public directory:"
        ls -la client/public/
        
        echo ""
        echo "Checking for index.html:"
        if [ -f "client/public/index.html" ]; then
            echo "index.html found!"
        else
            echo "index.html NOT found!"
        fi
    else
        echo "client/public directory does NOT exist!"
    fi
else
    echo "client directory does NOT exist!"
fi

echo ""
echo "Checking for src directory:"
if [ -d "src" ]; then
    echo "src directory exists"
    echo "Contents of src directory:"
    ls -la src/
else
    echo "src directory does NOT exist!"
fi

echo ""
echo "Attempting to build..."
cd client
echo "Now in client directory: $(pwd)"
echo "Contents of client directory:"
ls -la

echo "Checking public directory in client:"
if [ -d "public" ]; then
    echo "public directory exists in client"
    echo "Contents of public directory:"
    ls -la public/
else
    echo "public directory does NOT exist in client!"
fi

npm run build
