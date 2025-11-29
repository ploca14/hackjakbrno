#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Store PIDs for cleanup
BACKEND_PID=""
FRONTEND_PID=""

# Cleanup function to stop IRIS on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    
    # Kill backend if running
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    # Kill frontend if running
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    echo "🛑 Stopping IRIS database..."
    cd "$SCRIPT_DIR/docker" || exit
    docker-compose down
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT SIGTERM

echo "🚀 Starting hackjakbrno project..."

# Start IRIS database
echo "📦 Starting IRIS database..."
cd "$SCRIPT_DIR/docker"
# Stop any existing containers first
docker-compose down 2>/dev/null || true
# Force remove container if it still exists
docker rm -f iris-fhir 2>/dev/null || true
docker-compose up -d
cd "$SCRIPT_DIR"

# Wait a moment for IRIS to initialize
echo "⏳ Waiting for IRIS to initialize..."
sleep 5

# Start backend in background
echo "🔧 Starting FastAPI backend..."
cd "$SCRIPT_DIR/back"
uv run fastapi dev --host localhost --port 8000 &
BACKEND_PID=$!

sleep 10


sleep 5

# Start frontend in background
echo "🔧 Starting Vite frontend..."
cd "$SCRIPT_DIR/front"
pnpm i
pnpm dev &
FRONTEND_PID=$!

# Wait for both processes
wait