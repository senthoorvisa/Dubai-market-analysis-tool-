@echo off
echo Starting Dubai Market Analysis Tool...
echo.

REM Kill any existing Node processes
taskkill /F /IM node.exe >nul 2>&1

REM Clean cache directories
if exist .next rmdir /s /q .next >nul 2>&1
if exist node_modules\.cache rmdir /s /q node_modules\.cache >nul 2>&1

REM Set environment variables to avoid OneDrive conflicts
set NEXT_TELEMETRY_DISABLED=1
set NODE_OPTIONS=--max-old-space-size=4096

echo Cleaning cache...
timeout /t 2 >nul

echo Starting development server on port 3001...
echo.
echo Open your browser and go to: http://localhost:3001
echo.

npm run dev -- --port 3001 