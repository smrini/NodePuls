#!/bin/bash

echo "🔍 System Monitoring Debug Script"
echo "================================="

echo ""
echo "📂 Checking mounted directories:"
echo "  /proc exists: $(test -d /proc && echo 'YES' || echo 'NO')"
echo "  /sys exists: $(test -d /sys && echo 'YES' || echo 'NO')"
echo "  /host/proc exists: $(test -d /host/proc && echo 'YES' || echo 'NO')"
echo "  /host/sys exists: $(test -d /host/sys && echo 'YES' || echo 'NO')"
echo "  /hostfs exists: $(test -d /hostfs && echo 'YES' || echo 'NO')"

echo ""
echo "🐳 Docker environment detection:"
echo "  .dockerenv exists: $(test -f /.dockerenv && echo 'YES' || echo 'NO')"
echo "  Docker in cgroup: $(test -f /proc/1/cgroup && grep -q docker /proc/1/cgroup && echo 'YES' || echo 'NO')"

echo ""
echo "💾 Memory information:"
if [ -f /proc/meminfo ]; then
    echo "  Total memory: $(grep MemTotal /proc/meminfo | awk '{print $2 " " $3}')"
    echo "  Available memory: $(grep MemAvailable /proc/meminfo | awk '{print $2 " " $3}')"
else
    echo "  /proc/meminfo not accessible"
fi

echo ""
echo "🌐 Network interfaces:"
if [ -f /proc/net/dev ]; then
    echo "  Available interfaces:"
    cat /proc/net/dev | grep -E "eth|en|wl" | head -5
else
    echo "  /proc/net/dev not accessible"
fi

echo ""
echo "🔥 CPU information:"
if [ -f /proc/cpuinfo ]; then
    echo "  CPU cores: $(grep -c processor /proc/cpuinfo)"
    echo "  CPU model: $(grep 'model name' /proc/cpuinfo | head -1 | cut -d: -f2 | xargs)"
else
    echo "  /proc/cpuinfo not accessible"
fi

echo ""
echo "💿 Disk information:"
df -h | head -10

echo ""
echo "🌡️ Temperature sensors:"
if command -v sensors >/dev/null 2>&1; then
    sensors 2>/dev/null | grep -E "Core|temp|°C" | head -5
else
    echo "  sensors command not available"
fi

if [ -d /sys/class/hwmon ]; then
    echo "  Hardware monitoring devices:"
    ls /sys/class/hwmon/ 2>/dev/null | head -5
else
    echo "  /sys/class/hwmon not accessible"
fi

echo ""
echo "===== Debug completed ====="
