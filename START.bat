@echo off
REM SafeTrAX Setup and Run Script for Windows
REM This script sets up and runs the SafeTrAX video annotation system

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         SAVETRAX 2.0 - Video Annotation System            ║
echo ║              Setup & Launch Script (Windows)              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if FFmpeg is installed
echo [1/5] Checking FFmpeg installation...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ FFmpeg not found! Please install FFmpeg:
    echo.
    echo    Option 1: Download from https://ffmpeg.org/download.html
    echo    Option 2: choco install ffmpeg
    echo    Option 3: scoop install ffmpeg
    echo.
    echo    After installation, restart this script.
    pause
    exit /b 1
)
echo ✅ FFmpeg found!
echo.

REM Install backend dependencies
echo [2/5] Installing backend dependencies...
cd /d "%~dp0backend"
if not exist "node_modules" (
    call npm install
    if !errorlevel! neq 0 (
        echo ❌ Backend npm install failed
        pause
        exit /b 1
    )
)
echo ✅ Backend ready!
echo.

REM Install frontend dependencies
echo [3/5] Installing frontend dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    call npm install
    if !errorlevel! neq 0 (
        echo ❌ Frontend npm install failed
        pause
        exit /b 1
    )
)
echo ✅ Frontend ready!
echo.

REM Create necessary directories
echo [4/5] Creating directories...
cd /d "%~dp0backend"
if not exist "uploads" mkdir uploads
if not exist "proxies" mkdir proxies
if not exist "metadata" mkdir metadata
echo ✅ Directories created!
echo.

REM Start servers
echo [5/5] Starting servers...
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                   STARTING SERVICES                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Backend will start on: http://localhost:4000
echo 🚀 Frontend will start on: http://localhost:5173
echo.
echo Press Ctrl+C in either window to stop the servers.
echo.

REM Start backend in a new window
cd /d "%~dp0backend"
start "SafeTrAX Backend" cmd /k "npm start"

REM Give backend time to start
timeout /t 3 /nobreak

REM Start frontend in a new window
cd /d "%~dp0frontend"
start "SafeTrAX Frontend" cmd /k "npm run dev"

REM Open browser
timeout /t 2 /nobreak
start http://localhost:5173

echo.
echo ✅ All services started!
echo.
pause
