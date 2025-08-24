#!/bin/bash

# Simple restart script for ServerDashboard
echo "🔄 Restarting ServerDashboard container..."

# Stop the container
echo "⏹️ Stopping container..."
docker-compose down

# Rebuild and start
echo "🔧 Building and starting container..."
docker-compose up --build -d

# Show logs
echo "📋 Showing logs..."
docker-compose logs -f --tail=50
