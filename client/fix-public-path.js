// Fix for Render deployment - ensure public directory is in expected location
const fs = require('fs');
const path = require('path');

console.log('=== Fixing public directory path ===');

// Check if we're in the right directory
console.log('Current working directory:', process.cwd());
console.log('Contents of current directory:', fs.readdirSync('.'));

// Check parent directory
console.log('Contents of parent directory:', fs.readdirSync('..'));

// Look for public directory in multiple locations
let publicPath = null;
const possiblePaths = [
  'public',
  '../public',
  '../client/public',
  '../../client/public'
];

for (const testPath of possiblePaths) {
  if (fs.existsSync(testPath)) {
    console.log(`✅ Found public directory at: ${testPath}`);
    publicPath = testPath;
    break;
  }
}

if (!publicPath) {
  console.log('❌ public directory not found in any expected location');
  console.log('Searched paths:', possiblePaths);
} else {
  console.log('Contents of public directory:', fs.readdirSync(publicPath));
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
if (publicPath) {
  console.log(`Copying public directory from ${publicPath} to src/client/public...`);
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
