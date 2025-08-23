#!/bin/bash

# Ubuntu Server Docker Monitoring Debug Script
echo "🔍 Homelab Dashboard - Docker Monitoring Debug"
echo "=============================================="

echo
echo "1. 📋 Container Status"
echo "----------------------"
docker-compose ps

echo
echo "2. 🖥️  Host System Info"
echo "----------------------"
echo "Host Memory:"
free -h
echo
echo "Host CPU:"
nproc
cat /proc/loadavg
echo
echo "Host Network Interfaces:"
ip link show | grep -E '^[0-9]+:'

echo
echo "3. 🐳 Container System Access Test"
echo "-----------------------------------"
echo "Testing /proc access:"
docker-compose exec homelab-dashboard ls -la /proc/meminfo 2>/dev/null && echo "✅ /proc accessible" || echo "❌ /proc not accessible"

echo "Testing /sys access:"
docker-compose exec homelab-dashboard ls -la /sys/class/net/ 2>/dev/null && echo "✅ /sys accessible" || echo "❌ /sys not accessible"

echo "Testing memory info:"
docker-compose exec homelab-dashboard head -5 /proc/meminfo 2>/dev/null || echo "❌ Cannot read meminfo"

echo "Testing network interfaces:"
docker-compose exec homelab-dashboard ls /sys/class/net/ 2>/dev/null || echo "❌ Cannot read network interfaces"

echo
echo "4. 📊 Application Logs"
echo "-----------------------"
echo "Last 20 lines of application logs:"
docker-compose logs --tail=20 homelab-dashboard

echo
echo "5. 🌐 API Health Check"
echo "-----------------------"
echo "Testing health endpoint:"
curl -s http://localhost:3020/api/health 2>/dev/null && echo "✅ API responding" || echo "❌ API not responding"

echo "Testing system endpoint:"
curl -s http://localhost:3020/api/system | head -200 2>/dev/null && echo "✅ System API responding" || echo "❌ System API not responding"

echo
echo "6. 🔧 Suggested Fixes"
echo "----------------------"
echo "If you see issues above, try these commands:"
echo
echo "# Restart with fresh container:"
echo "docker-compose down"
echo "docker-compose up -d"
echo
echo "# Check container privileges:"
echo "docker inspect homelab-dashboard_homelab-dashboard_1 | grep -i privileged"
echo
echo "# View real-time logs:"
echo "docker-compose logs -f homelab-dashboard"
echo
echo "# Force rebuild:"
echo "docker-compose down"
echo "docker-compose build --no-cache"
echo "docker-compose up -d"
