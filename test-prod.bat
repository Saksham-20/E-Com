@echo off
echo === Testing Production Build Locally ===

REM Set production environment
set NODE_ENV=production

REM Check if build exists
if not exist "client\build" (
    echo Production build not found. Building now...
    call build-prod.bat
)

REM Copy production environment file
if not exist ".env" (
    if exist ".env.production" (
        echo Copying production environment configuration...
        copy ".env.production" ".env"
    ) else (
        echo Creating production environment file...
        copy "env.example" ".env"
        echo.
        echo WARNING: Please update .env with your production values before testing!
        echo.
    )
)

REM Install server dependencies
echo Installing server dependencies...
call npm install

REM Start production server
echo Starting production server...
echo Server will be available at: http://localhost:5000
echo.
call npm run start:prod
