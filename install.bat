@echo off
echo.
echo ============================================
echo   Pentecost Preparatory School Website
echo   Installation Script v2.0
echo ============================================
echo.

node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo ERROR: Node.js is not installed.
  echo Download from: https://nodejs.org
  pause
  exit /b 1
)

echo Installing dependencies...
npm install

echo.
echo Creating required directories...
if not exist "data" mkdir data
if not exist "public\uploads" mkdir public\uploads

echo.
echo ============================================
echo   Starting PPS School Website Server...
echo ============================================
echo.
echo   Website:     http://localhost:3000
echo   Admin Panel: http://localhost:3000/admin
echo   Login:       admin / pps2025
echo.
echo   Press Ctrl+C to stop.
echo.

node server.js
pause
