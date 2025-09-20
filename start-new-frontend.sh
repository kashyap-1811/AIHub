#!/bin/bash

# AIHub New Frontend Startup Script
echo "🚀 Starting AIHub New Frontend..."

# Function to start new frontend
start_new_frontend() {
    echo "🎨 Starting New Frontend..."
    cd Frontend
    npm run dev &
    FRONTEND_PID=$!
    echo "New Frontend started with PID: $FRONTEND_PID"
    echo "New Frontend URL: http://localhost:5173"
}

# Start new frontend
start_new_frontend

echo ""
echo "✅ New Frontend is starting up!"
echo "🎨 New Frontend: http://localhost:5173"
echo ""
echo "Features:"
echo "  - ChatGPT-like dark theme UI"
echo "  - Model selection for each chat"
echo "  - Proper routing with URLs for each chat"
echo "  - Login/Register pages"
echo "  - API key management"
echo "  - Profile page"
echo "  - Support page"
echo ""
echo "Press Ctrl+C to stop"

# Wait for user to stop
wait
