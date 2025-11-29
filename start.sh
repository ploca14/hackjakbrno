#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cleanup function to stop IRIS on exit
cleanup() {
    echo ""
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

# Start backend
echo "🔧 Starting FastAPI backend..."
cd "$SCRIPT_DIR/back"
uv run fastapi dev

