@echo off
echo === Building Production Frontend ===

REM Set production environment
set NODE_ENV=production

REM Navigate to client directory
cd client

REM Install dependencies if needed
echo Installing dependencies...
call npm install

REM Build the React app
echo Building React app for production...
call npm run build

echo === Production build completed! ===
echo Build files are in: client\build\
echo.
echo To test the production build:
echo 1. Copy .env.production to .env
echo 2. Run: npm run start:prod
echo 3. Open http://localhost:5000 in your browser
