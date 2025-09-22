// Fix for Render deployment - ensure public directory is in expected location
const fs = require('fs');
const path = require('path');

console.log('=== Fixing public directory path ===');

// Check if we're in the right directory
console.log('Current working directory:', process.cwd());
console.log('Contents of current directory:', fs.readdirSync('.'));

// Check if public directory exists
if (fs.existsSync('public')) {
  console.log('✅ public directory exists');
  console.log('Contents of public directory:', fs.readdirSync('public'));
} else {
  console.log('❌ public directory not found');
}

// Check if src directory exists and create it if needed
if (!fs.existsSync('src')) {
  console.log('Creating src directory...');
  fs.mkdirSync('src');
}

// Check if src/client exists
if (!fs.existsSync('src/client')) {
  console.log('Creating src/client directory...');
  fs.mkdirSync('src/client', { recursive: true });
}

// Copy public directory to src/client/public
if (fs.existsSync('public')) {
  console.log('Copying public directory to src/client/public...');
  const publicPath = 'public';
  const targetPath = 'src/client/public';
  
  // Remove target if it exists
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
  
  // Copy public directory
  fs.cpSync(publicPath, targetPath, { recursive: true });
  
  console.log('✅ Public directory copied successfully');
  console.log('Contents of src/client/public:', fs.readdirSync('src/client/public'));
} else {
  console.log('❌ Cannot copy public directory - it does not exist');
}

console.log('=== Path fix completed ===');
