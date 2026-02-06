#!/bin/bash

# SafeTrAX Setup and Run Script for macOS/Linux
# This script sets up and runs the SafeTrAX video annotation system

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         SAVETRAX 2.0 - Video Annotation System            ║"
echo "║              Setup & Launch Script (Unix)                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Function to print colored output
print_step() {
    echo "✓ $1"
}

print_error() {
    echo "✗ $1"
    exit 1
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if FFmpeg is installed
echo "[1/5] Checking FFmpeg installation..."
if ! command -v ffmpeg &> /dev/null; then
    echo ""
    echo "✗ FFmpeg not found! Please install FFmpeg:"
    echo ""
    echo "  macOS:"
    echo "    brew install ffmpeg ffprobe"
    echo ""
    echo "  Ubuntu/Debian:"
    echo "    sudo apt-get install ffmpeg"
    echo ""
    echo "  Fedora/RHEL:"
    echo "    sudo dnf install ffmpeg"
    echo ""
    exit 1
fi
print_step "FFmpeg found ($(ffmpeg -version | head -n 1))"
echo ""

# Install backend dependencies
echo "[2/5] Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
if [ ! -d "node_modules" ]; then
    npm install || print_error "Backend npm install failed"
fi
print_step "Backend ready!"
echo ""

# Install frontend dependencies
echo "[3/5] Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    npm install || print_error "Frontend npm install failed"
fi
print_step "Frontend ready!"
echo ""

# Create necessary directories
echo "[4/5] Creating directories..."
cd "$SCRIPT_DIR/backend"
mkdir -p uploads proxies metadata
print_step "Directories created!"
echo ""

# Start servers
echo "[5/5] Starting servers..."
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   STARTING SERVICES                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Backend will start on: http://localhost:4000"
echo "🚀 Frontend will start on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the servers."
echo ""

# Create a temporary directory for logs
TEMP_DIR=$(mktemp -d)
BACKEND_LOG="$TEMP_DIR/backend.log"
FRONTEND_LOG="$TEMP_DIR/frontend.log"

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    rm -rf "$TEMP_DIR"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
cd "$SCRIPT_DIR/backend"
npm start > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Wait for backend to start
sleep 3

# Start frontend
cd "$SCRIPT_DIR/frontend"
npm run dev > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

# Open browser (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    sleep 2
    open http://localhost:5173 || true
fi

echo ""
echo "✓ All services started!"
echo ""
echo "Available logs:"
echo "  Backend:  $BACKEND_LOG"
echo "  Frontend: $FRONTEND_LOG"
echo ""

# Keep script running
wait
