@echo off
REM Code Review Script for Luxury E-commerce Project
REM This script provides easy commands to run local code reviews

setlocal enabledelayedexpansion

REM Check if npm is available
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    exit /b 1
)
echo [SUCCESS] npm found

REM Main script logic
if "%1"=="full" goto :full_review
if "%1"=="lint" goto :lint_review
if "%1"=="security" goto :security_review
if "%1"=="fix" goto :fix_lint
if "%1"=="client" goto :client_review
if "%1"=="server" goto :server_review
if "%1"=="files" goto :files_review
if "%1"=="install" goto :install_deps
if "%1"=="help" goto :show_help
goto :show_help

:full_review
echo [INFO] Running full project review...
call npm run lint
call npm run security:audit
echo [SUCCESS] Full review completed
goto :end

:lint_review
echo [INFO] Running ESLint review...
call npm run lint
echo [SUCCESS] Linting completed
goto :end

:security_review
echo [INFO] Running security audit...
call npm run security:audit
echo [SUCCESS] Security review completed
goto :end

:fix_lint
echo [INFO] Fixing auto-fixable linting issues...
call npm run lint:fix
echo [SUCCESS] Lint fixes completed
goto :end

:client_review
echo [INFO] Running client-side code review...
call npm run lint:client
echo [SUCCESS] Client review completed
goto :end

:server_review
echo [INFO] Running server-side code review...
call npm run lint:server
echo [SUCCESS] Server review completed
goto :end

:files_review
if "%2"=="" (
    echo [ERROR] Please specify files to review
    echo Usage: %0 files "path/to/file1.js path/to/file2.js"
    exit /b 1
)
echo [INFO] Reviewing specific files: %2
call npx eslint %2
echo [SUCCESS] File review completed
goto :end

:install_deps
echo [INFO] Installing review dependencies...
call npm install
echo [SUCCESS] Dependencies installed
goto :end

:show_help
echo Code Review Script for Luxury E-commerce Project
echo.
echo Usage: %0 [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   full                    Run full project review (lint + security)
echo   lint                    Run ESLint only
echo   security                Run security audit only
echo   fix                     Fix auto-fixable linting issues
echo   client                  Review client-side code only
echo   server                  Review server-side code only
echo   files "file1 file2"     Review specific files
echo   install                 Install review dependencies
echo   help                    Show this help message
echo.
echo Examples:
echo   %0 full
echo   %0 lint
echo   %0 files "client/src/context/AuthContext.js"
echo   %0 fix
echo.
echo Note: For CodeRabbit integration, set up GitHub integration at coderabbit.ai
echo.
goto :end

:end
endlocal