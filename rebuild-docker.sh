#!/bin/bash

# Rebuild Docker container script for homelab dashboard

echo "🔄 Stopping existing container..."
sudo docker-compose down

echo "🏗️ Building new container..."
sudo docker-compose build --no-cache

echo "🚀 Starting container..."
sudo docker-compose up -d

echo "📊 Showing logs..."
sudo docker-compose logs -f
