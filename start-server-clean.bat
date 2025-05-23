@echo off
echo 🚀 Starting Dubai Market Analysis Tool...
echo.

REM Clean up any existing build artifacts
echo 🧹 Cleaning build cache...
if exist .next rmdir /s /q .next 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul

REM Set environment variables to avoid OneDrive conflicts
set NEXT_TELEMETRY_DISABLED=1
set NODE_OPTIONS=--max-old-space-size=4096

echo 🔧 Environment configured
echo 📦 Starting Next.js development server...
echo.
echo 🌐 Server will be available at: http://localhost:3000
echo 📊 Rental Analysis: http://localhost:3000/rental-analysis
echo 🏠 Property Lookup: http://localhost:3000/property-lookup
echo 👥 Developer Analysis: http://localhost:3000/developer-analysis
echo 📈 Demographics: http://localhost:3000/demographics
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev 