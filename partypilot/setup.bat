@echo off
REM PartyPilot Quick Setup Script for Windows

echo ========================================
echo      PartyPilot Setup Script
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo [OK] Node.js version:
node -v

REM Check MongoDB
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MongoDB not found. Please install MongoDB 7+
    echo Visit: https://www.mongodb.com/try/download/community
)

echo.
echo Installing dependencies...
cd backend
call npm install

echo.
echo Setting up environment...
if not exist .env (
    copy .env.example .env
    echo [OK] Created .env file - Please configure with your credentials
) else (
    echo [OK] .env file already exists
)

echo.
echo Seeding database...
call npm run seed

echo.
echo ========================================
echo      Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure .env file with your API keys
echo 2. Start MongoDB (if not running)
echo 3. Start server: npm start
echo 4. Open browser: http://localhost:3000
echo.
echo For production deployment, see PRODUCTION_GUIDE.md
echo.
pause
