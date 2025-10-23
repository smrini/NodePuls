# NodePuls 🚀

<div align="center">

![NodePuls Logo](client/public/nodepuls.svg)

**A beautiful, lightweight real-time homelab monitoring dashboard**

*Advanced system monitoring with intelligent website uptime tracking and modern UI design*

## 📸 Dashboard Preview

![NodePuls Dashboard](https://i.imgur.com/6KZs3Nl.png)

*Real-time system monitoring with beautiful charts, website uptime tracking, and modern dark theme interface*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.7.3-brightgreen.svg)](https://github.com/smrini/NodePuls/releases)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

[🆕 Latest Updates](#-latest-updates) &#124; [🚀 Quick Start](#-quick-start) &#124; [✨ Features](#-features) &#124; [🛠️ Tech Stack](#%EF%B8%8F-tech-stack) &#124; [⚙️ Configuration](#%EF%B8%8F-configuration) &#124; [🤖 Automation](#-automation--integration) &#124; [🐳 Deployment](#-deployment-options) &#124; [🛠️ Development](#%EF%B8%8F-development) &#124; [🐛 Troubleshooting](#-troubleshooting)

</div>

---

## 📋 Table of Contents

1. [🆕 Latest Updates](#-latest-updates)
2. [🚀 Quick Start](#-quick-start)
3. [✨ Features](#-features)
4. [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
5. [📋 Available Commands](#-available-commands)
6. [⚙️ Configuration](#%EF%B8%8F-configuration)
7. [🔧 API Reference](#-api-reference)
8. [🤖 Automation & Integration](#-automation--integration)
9. [📋 System Requirements](#-system-requirements)
10. [📁 Project Structure](#-project-structure)
11. [🐳 Deployment Options](#-deployment-options)
12. [🛠️ Development](#%EF%B8%8F-development)
13. [🐛 Troubleshooting](#-troubleshooting)
14. [🔒 Security & Best Practices](#-security--best-practices)
15. [🤝 Contributing](#-contributing)
16. [📞 Support & Contact](#-support--contact)

---

## 🆕 Latest Updates:
- 📤 **Website Import/Export**: JSON-based bulk website management with drag-and-drop reordering
- 🎨 **Hidden Scrollbars**: Clean UI with globally hidden scrollbars while maintaining scroll functionality
- 🔄 **Unique ID Generation**: Fixed import collision issues with timestamp + counter + random ID system
- 🛡️ **Redundant Website Monitoring**: Eliminates false "Down" alerts with 3-tier checking (HEAD → GET → Retry)
- 🏥 **Health Scoring System**: Gradual health degradation prevents single-failure false positives
- 📊 **Adaptive Chart Visualization**: Dynamic scaling with per-website performance thresholds  
- ⚡ **Smart Resource Management**: System monitoring only runs when clients are connected
- 🔧 **Enhanced Reliability**: 10-second timeouts and improved error handling


## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** and npm
- **Git** for cloning
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### 1️⃣ Installation

```bash
# Clone repository
git clone https://github.com/smrini/NodePuls.git
cd NodePuls

# Install all dependencies (client + server)
npm run install:all
```

**📝 Note**: The repository includes a sample `homelab.db` with example websites for immediate testing. This contains no sensitive data and helps new users get started quickly. Example sites include Google, Nextcloud, Home Assistant, and other common homelab services.

**🆕 Recent Improvements**: NodePuls now features JSON-based website import/export with bulk management, globally hidden scrollbars for a clean interface, advanced redundant website monitoring that eliminates false "Down" alerts, adaptive chart visualization with intelligent scaling, and optimized resource usage that only monitors system resources when clients are connected.

### 2️⃣ Development

```bash
# Start development with hot reload (recommended)
npm run dev:watch

# Or build once and start server
npm run dev
```

**Access your dashboard:**
- 🌟 **Main Application**: http://localhost:3020

### 3️⃣ Production

```bash
# Build and start production server (one command)
npm run start:prod

# Or step by step
npm run build    # Cross-platform build process
npm start       # Start with production environment
```

---

## ✨ Features

### 🖥️ **System Monitoring**
- **Real-time Metrics**: CPU usage, CPU temperature, RAM usage, Disks, Network usage with live updates every 5 seconds
- **System Uptime**: Track server uptime with formatted display (days, hours, minutes)
- **Device Selection**: Monitor specific network adapters and disks with dropdown selection
- **Resource Charts**: Beautiful animated charts showing usage trends with 50-point history

### 🌐 **Advanced Website Monitoring**
- **Integrated Website Launcher**: Add, monitor, and launch websites directly from the dashboard with one-click access to your homelab services
- **Import/Export Functionality**: JSON-based bulk website management with validation and error handling
- **Drag & Drop Reordering**: Persistent website order with database-backed sort functionality
- **Uptime Tracking**: Monitor multiple websites simultaneously with TCP ping + HTTP checks
- **Multi-Method Checking**: HEAD → GET → Retry strategy for maximum reliability
- **Health Scoring System**: Gradual health degradation prevents false "down" alerts (eliminates Google/Cloudflare false positives)
- **Redundant Monitoring**: 3-tier checking system with intelligent fallback and 10-second timeouts
- **Smart Status Logic**: Sites marked down only after multiple consecutive failures AND low health score
- **Response Time Analytics**: Dynamic chart scaling with adaptive thresholds per website
- **Unique ID System**: Collision-resistant ID generation (timestamp + counter + random) for rapid imports
- **Port Number Display**: Proper formatting for IP addresses with custom ports (e.g., 192.168.1.100:8080)
- **Status History**: Historical uptime data with SQLite storage and automatic cleanup
- **Smart Analytics**: Comprehensive uptime statistics and response time trends with intelligent scaling
- **Client-Aware Resource Management**: System monitoring starts/stops based on client connections

### 🎨 **Modern UI/UX**
- **Hidden Scrollbars**: Clean interface with globally hidden scrollbars across all browsers
- **Animated Logo**: Custom NodePuls branding with hover effects and responsive scaling
- **Dark Theme**: Professional dark interface optimized for 24/7 monitoring
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices with adaptive grid layouts
- **Live Updates**: WebSocket-powered real-time data without page refreshes
- **Interactive Charts**: Hover effects, smooth animations, and color-coded metrics
- **Touch-Optimized**: Disabled tap highlights and optimized mobile interactions
- **Dynamic Height Management**: Automatic section height adjustment for optimal space usage

### ⚡ **Performance & Reliability**
- **Lightweight**: Minimal resource footprint ideal for homelab environments
- **WebSocket Communication**: Efficient real-time data transmission via Socket.IO
- **SQLite Database**: Zero-configuration embedded database with automatic migrations
- **Error Handling**: Robust error recovery and connection management
- **Docker Optimized**: Multi-stage builds with Alpine Linux for minimal production images

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Recharts, Lucide React Icons |
| **Backend** | Node.js, Express.js, Socket.IO, SQLite3 |
| **Monitoring** | systeminformation, axios, node-cron |
| **Build Tools** | React Scripts, Docker Multi-stage, Alpine Linux |
| **Deployment** | Docker Compose, PM2, systemd, Nginx |

---

## 📋 Available Commands

### 🚀 Development Commands
```bash
npm run dev:watch    # Start with auto-rebuild on file changes ⚡ (RECOMMENDED)
npm run dev          # Build once and start server
npm run server       # Start only Express server with nodemon
```

### 🏗️ Build Commands
```bash
npm run build        # Full production build (client + copy to server)
npm run build:client # Build React app only
npm run build:copy   # Copy build files to server/public (cross-platform)
npm run build:watch  # Auto-rebuild on file changes
```

### 🚀 Production Commands
```bash
npm start           # Start production server with NODE_ENV=production
npm run start:prod  # Build and start production server
```

### 🛠️ Utility Commands
```bash
npm run install:all  # Install dependencies for both client and server
npm run clean        # Remove build artifacts and temp files
npm test            # Run React component tests
npm run test:ci     # Run tests once without watch mode
npm run test:all    # Run tests with watch mode
```

### 🔧 Cross-Platform Improvements
All build commands now work on **Windows, macOS, and Linux** using Node.js scripts instead of platform-specific commands.

---

## ⚙️ Configuration

### 🔧 Simple Single Port Configuration

NodePuls uses an **intelligent single-port system** for effortless deployment:

```env
# 📝 Edit .env file - Simple configuration!
PORT=3020          # 🌐 Single port for both API and frontend

# ✨ All URLs auto-configured:
# Frontend: http://localhost:3020/
# API: http://localhost:3020/api/*
# WebSocket: ws://localhost:3020
# Static Assets: /server/public/
```

**🚀 To change the port:**
1. Edit `PORT` in `.env`
2. Restart with `npm run dev`
3. Done! All services update automatically ✅

### 🔑 Environment Variables

The application uses a centralized environment loader (`env-loader.js`) that loads configuration in this priority order:
1. **System environment variables** (highest priority)
2. **Local `.env` files** (client/.env, server/.env)
3. **Root `.env` file** (lowest priority)

#### **Core Configuration**
```env
# 🌐 Network Settings
PORT=3020                    # Single port for both API and frontend
NODE_ENV=production          # Environment mode
CORS_ORIGIN=                 # Auto-generated if not specified

# 📊 Database
DB_PATH=/app/data/homelab.db # SQLite database path
```

#### **🔍 Enhanced Monitoring Configuration**
```env
# ⏱️ Website Monitoring
WEBSITE_CHECK_TIMEOUT=10000      # Website check timeout (increased from 5s to 10s)
WEBSITE_CHECK_INTERVAL="*/1 * * * *"  # Cron schedule for checks (every minute)
MAX_WEBSITE_HISTORY=1440         # 24 hours of history at 1-minute intervals
WEBSITE_DOWN_THRESHOLD=3         # Consecutive failures before marking down

# 🏥 Health Scoring System (NEW)
HEALTH_SCORE_SUCCESS_BONUS=10    # Health points gained on successful check
HEALTH_SCORE_FAILURE_PENALTY=15  # Health points lost on failed check
HEALTH_SCORE_DOWN_THRESHOLD=30   # Health % threshold for marking site down
MIN_CONSECUTIVE_FAILURES=2       # Minimum consecutive failures required

# 🔄 Website Management (ENHANCED)
ENABLE_WEBSITE_ORDERING=true     # Enable drag-and-drop website reordering
IMPORT_VALIDATION=strict         # JSON import validation level (strict/loose)
MAX_BULK_IMPORT=50              # Maximum websites per import operation

# ⏱️ System Monitoring  
MONITOR_INTERVAL=5000            # System metrics update interval (ms)
SYSTEM_UPDATE_INTERVAL=5000      # System monitoring interval (ms)
CLEANUP_INTERVAL=24              # Database cleanup interval (hours)
DEFAULT_TIMEOUT=10000            # Default timeout for HTTP requests (ms)
MAX_HISTORY_ENTRIES=100          # Maximum history entries per website

# 📈 Performance Settings
COMPRESSION_LEVEL=6
REQUEST_TIMEOUT=10000
MAX_CONNECTIONS=100
```

#### **⚡ Feature Toggles**
```env
# 🔥 System Monitoring Features
ENABLE_CPU_TEMPERATURE=true          # CPU temperature monitoring
ENABLE_DISK_IO_MONITORING=true       # Disk I/O statistics
ENABLE_PROCESS_MONITORING=true       # Running processes monitoring

# 🛡️ Security Features
ENABLE_HELMET=true           # Security headers
TRUST_PROXY=false           # Proxy configuration
```

### 📊 System Monitoring

NodePuls automatically monitors:

| Metric | Details | Update Frequency |
|--------|---------|------------------|
| **🔥 CPU Usage** | Real-time percentage, load average, core count | 5 seconds |
| **💾 Memory Usage** | RAM usage, available memory, percentage | 5 seconds |
| **💿 Disk Usage** | Free/used space for all mounted drives | 5 seconds |
| **🌐 Network Activity** | Upload/download speeds, interface selection | 5 seconds |
| **⏰ System Info** | OS details, uptime, hostname, architecture | On startup |
| **🌡️ Temperature** | CPU temperature (if supported) | 5 seconds |

### 🌐 Website Monitoring

**Adding Websites:**
1. 🖱️ Click **"Add Website"** button in the dashboard
2. 📝 Enter website name and URL (supports various formats):
   - `google.com` → auto-converted to `http://google.com`
   - `192.168.1.100:8080` → auto-converted to `http://192.168.1.100:8080`
   - `https://example.com` → used as-is
   - Validation ensures proper URL format before adding
3. 📊 Monitor response times and uptime percentage automatically

**Bulk Management:**
- 📥 **Import**: Click the three-dot menu → "Import" to upload JSON files with website lists
- 📤 **Export**: Click the three-dot menu → "Export" to download current website configuration
- 🔄 **Drag & Drop**: Reorder websites by dragging cards; order persists across sessions
- 🎯 **JSON Format**: `[{"name": "Website Name", "url": "https://example.com"}]`

**Enhanced URL Display:**
- **Port Preservation**: IP addresses with custom ports display correctly (e.g., `192.168.1.100:8080`)
- **Smart Formatting**: Shows hostname/IP with port when not default (80/443)
- **Clean Display**: Hides default ports for standard HTTP/HTTPS

**Monitored Metrics:**
- ✅ **Uptime Status**: Online/Offline status with health-based logic and multi-method checking
- ⏱️ **Response Time**: TCP connection + HTTP response time in milliseconds
- 🏥 **Health Score**: Dynamic health percentage (0-100%) with failure tracking and gradual degradation
- 📈 **Uptime Percentage**: Historical uptime statistics
- 🕐 **Last Check**: Timestamp of most recent check with detailed attempt information
- 📜 **Status History**: SQLite-stored historical data with analytics
- 🔄 **Check Methods**: Logs show which checking methods were used (HEAD/GET/Retry)
- 🛡️ **Redundant Checking**: Three-tier verification system prevents false positives

---

## 🔧 API Reference

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| GET | `/api/config` | Client configuration |
| GET | `/api/system` | Current system stats |
| GET | `/api/websites` | All monitored websites with history |
| POST | `/api/websites` | Add new website `{name, url}` |
| DELETE | `/api/websites/:id` | Remove website by ID |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `systemUpdate` | Server → Client | Real-time system metrics (only when clients connected) |
| `websites` | Server → Client | Updated website list with health scores and sort order |
| `addWebsite` | Client → Server | Add new website with URL validation and unique ID generation |
| `removeWebsite` | Client → Server | Remove website by ID |
| `updateWebsite` | Client → Server | Update website details (name, URL) |
| `updateWebsiteOrder` | Client → Server | Reorder websites via drag & drop with persistent storage |
| `clearWebsiteHistory` | Client → Server | Clear historical data for specific website |
| `error` | Server → Client | Error messages for failed operations |

### Real-time Features

- **🔄 Auto-reconnection**: WebSocket automatically reconnects on connection loss
- **⚡ Live Updates**: System metrics update every 5 seconds when viewed
- **🛡️ Smart Resource Usage**: System monitoring pauses when no clients connected
- **🌐 Continuous Uptime Monitoring**: Website checks run 24/7 regardless of viewers
- **📊 Dynamic Charts**: Real-time chart updates with adaptive scaling

---

## 🤖 Automation & Integration

NodePuls provides a REST API that enables automation from external tools and platforms:

#### **Adding Websites Programmatically**
```bash
# Add a new website via API
curl -X POST http://localhost:3020/api/websites \
  -H "Content-Type: application/json" \
  -d '{"name": "My Home Server", "url": "https://192.168.1.100:8080"}'
```

#### **Home Assistant Integration**
```yaml
# configuration.yaml - Add websites to NodePuls from Home Assistant
rest_command:
  add_nodepuls_website:
    url: "http://your-nodepuls-server:3020/api/websites"
    method: POST
    headers:
      content-type: "application/json"
    payload: '{"name": "{{ name }}", "url": "{{ url }}"}'

# Example automation
automation:
  - alias: "Add new device to NodePuls monitoring"
    trigger:
      - platform: state
        entity_id: device_tracker.new_device
        to: "home"
    action:
      - service: rest_command.add_nodepuls_website
        data:
          name: "{{ trigger.to_state.attributes.friendly_name }}"
          url: "http://{{ trigger.to_state.attributes.ip }}"
```

#### **Tasker (Android) Integration**
```javascript
// Tasker HTTP Request Action
// URL: http://your-nodepuls-server:3020/api/websites
// Method: POST
// Headers: Content-Type: application/json
// Body: {"name": "%website_name", "url": "%website_url"}

// Example: Add current WiFi gateway to monitoring
var gatewayIP = "%WIFI_GATEWAY";
var deviceName = "%WIFI_SSID Gateway";
var payload = JSON.stringify({
    "name": deviceName,
    "url": "http://" + gatewayIP
});
```

#### **PowerShell Automation (Windows)**
```powershell
# Add website to NodePuls monitoring
function Add-NodePulsWebsite {
    param(
        [string]$Name,
        [string]$Url,
        [string]$NodePulsServer = "http://localhost:3020"
    )
    
    $body = @{
        name = $Name
        url = $Url
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$NodePulsServer/api/websites" -Method POST -Body $body -ContentType "application/json"
        Write-Host "✅ Added $Name ($Url) to NodePuls monitoring"
    } catch {
        Write-Error "❌ Failed to add website: $($_.Exception.Message)"
    }
}

# Example usage
Add-NodePulsWebsite -Name "Router Admin" -Url "http://192.168.1.1"
Add-NodePulsWebsite -Name "NAS WebUI" -Url "https://nas.local:5001"
```

#### **Python Integration**
```python
import requests
import json

def add_nodepuls_website(name, url, server="http://localhost:3020"):
    """Add a website to NodePuls monitoring"""
    endpoint = f"{server}/api/websites"
    payload = {"name": name, "url": url}
    
    try:
        response = requests.post(endpoint, json=payload)
        response.raise_for_status()
        print(f"✅ Added {name} ({url}) to NodePuls monitoring")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to add website: {e}")
        return None

def get_system_status(server="http://localhost:3020"):
    """Get current system status"""
    try:
        response = requests.get(f"{server}/api/system")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to get system status: {e}")
        return None

# Example usage
add_nodepuls_website("Plex Server", "http://192.168.1.50:32400")
add_nodepuls_website("Pi-hole", "http://192.168.1.2/admin")

# Get current system metrics
status = get_system_status()
if status:
    print(f"CPU: {status['cpu']['usage']}%")
    print(f"Memory: {status['memory']['percentage']}%")
```

#### **Node-RED Integration**
```json
// HTTP Request Node Configuration
{
    "method": "POST",
    "url": "http://your-nodepuls-server:3020/api/websites",
    "headers": {"Content-Type": "application/json"},
    "payload": {
        "name": "{{msg.device_name}}",
        "url": "{{msg.device_url}}"
    }
}
```

#### **API Response Examples**
```json
// Successful website addition
{
    "success": true,
    "website": {
        "id": 8,
        "name": "My Home Server",
        "url": "https://192.168.1.100:8080",
        "status": "unknown",
        "health_score": 100,
        "created_at": "2025-01-15T10:30:00Z"
    }
}

// Error response
{
    "error": "URL validation failed",
    "details": "Invalid URL format"
}
```

#### **Bulk Operations**
```bash
# Add multiple websites at once (bash script)
#!/bin/bash
NODEPULS_SERVER="http://localhost:3020"

websites=(
    "Router|http://192.168.1.1"
    "NAS|http://192.168.1.10:5000"
    "Pi-hole|http://192.168.1.2/admin"
    "Home Assistant|http://192.168.1.5:8123"
)

for website in "${websites[@]}"; do
    IFS='|' read -r name url <<< "$website"
    curl -X POST "$NODEPULS_SERVER/api/websites" \
         -H "Content-Type: application/json" \
         -d "{\"name\": \"$name\", \"url\": \"$url\"}" \
         -s | jq '.success // false' > /dev/null && \
    echo "✅ Added $name" || echo "❌ Failed to add $name"
done
```

**💡 Pro Tip**: Use the dashboard's import/export feature for easier bulk management! The improved unique ID generation system now handles rapid imports without collisions.

#### **Health Check Automation**
```bash
# Check if NodePuls is healthy and all monitored sites are up
#!/bin/bash
NODEPULS_SERVER="http://localhost:3020"

# Check NodePuls health
health=$(curl -s "$NODEPULS_SERVER/api/health" | jq -r '.status // "unknown"')
if [ "$health" != "ok" ]; then
    echo "❌ NodePuls server is not healthy"
    exit 1
fi

# Get websites status
websites=$(curl -s "$NODEPULS_SERVER/api/websites")
down_sites=$(echo "$websites" | jq -r '.[] | select(.status == "down") | .name')

if [ -n "$down_sites" ]; then
    echo "⚠️ Sites currently down:"
    echo "$down_sites"
    # Send notification (customize as needed)
    # notify-send "NodePuls Alert" "Some monitored sites are down"
else
    echo "✅ All monitored sites are up"
fi
```

---

## 📋 System Requirements

### **Minimum Requirements**
- **RAM**: 512MB available
- **CPU**: 1 core (any architecture)
- **Storage**: 100MB free space
- **Node.js**: Version 20.0+
- **OS**: Any Node.js supported platform

### **Recommended Specifications**
- **RAM**: 1GB+ available
- **CPU**: 2+ cores
- **Storage**: 500MB+ free space
- **Network**: Stable internet connection
- **Browser**: Modern browser with WebSocket support

### **Supported Platforms**
- 🐧 **Linux**: Ubuntu, Debian, CentOS, RHEL, Arch
- 🍎 **macOS**: 10.15+ (Catalina and newer)
- 🪟 **Windows**: Windows 10/11, Windows Server 2019+
- 🐳 **Docker**: Any Docker-supported platform

---

## 📁 Project Structure

```
NodePuls/
├── 📁 client/                   # React 19 + TypeScript frontend
│   ├── 📁 public/               # Static assets
│   │   ├── 🎨 nodepuls.svg      # Custom NodePuls logo
│   │   ├── 📄 index.html        # HTML template
│   │   └── 📋 manifest.json     # PWA manifest
│   ├── 📁 src/                  # React source code
│   │   ├── 📁 components/       # React components
│   │   │   ├── 📊 Dashboard.tsx      # Main dashboard orchestrator
│   │   │   ├── 📈 ResourceCharts.tsx # System performance charts
│   │   │   ├── 📊 SystemStats.tsx    # System metrics overview
│   │   │   ├── 🌐 WebsiteMonitor.tsx # Website uptime monitoring
│   │   │   └── 🔗 ConnectionStatus.tsx # WebSocket status indicator
│   │   ├── 🎨 App.css           # Global styles
│   │   ├── ⚛️ App.tsx           # Main App component
│   │   └── 📄 types.ts          # TypeScript definitions
│   └── 📦 package.json          # Client dependencies
├── 📁 server/                   # Node.js Express backend
│   ├── 📁 services/             # Core business logic
│   │   ├── 🗄️ databaseService.js    # SQLite operations & migrations
│   │   ├── 📊 systemMonitor.js      # System metrics collection
│   │   └── 🌐 uptimeMonitor.js      # Website monitoring & analytics
│   ├── 📁 data/                 # SQLite database storage
│   │   └── 🗄️ homelab.db            # Sample database with example websites
│   ├── 📁 public/               # Built React app (production)
│   └── 🚀 index.js              # Express server entry point
├── 📁 scripts/                  # Build and utility scripts
│   ├── 🔧 copy-build.js         # Cross-platform build file copying
│   └── 🧹 clean.js              # Clean build artifacts
├── 🐳 docker-compose.yml        # Docker deployment configuration
├── 🐳 Dockerfile               # Multi-stage Docker build
├── ⚙️ config.js                 # Centralized configuration
├── ⚙️ env-loader.js             # Environment variable loader
├── 📝 .env.example             # Environment template (316+ options)
└── 📦 package.json             # Main project configuration
```

---

## Deployment Options

### 🐳 Docker Deployment (Recommended)

#### **Quick Start**
```bash
# 1️⃣ Clone and navigate to NodePuls Directory
git clone https://github.com/smrini/NodePuls.git
cd NodePuls

# 2️⃣ Build the website with Docker Compose
docker compose build --no-cache

# 3️⃣ Start the docker container
docker compose up -d

# 4️⃣ Access it at http://server-ip:3020
```

#### **Production Configuration**

The included `docker-compose.yml` provides a complete production setup with:
- **Multi-stage builds**: Optimized Alpine Linux base (~50MB final image)
- **Host monitoring**: Access to host system metrics via volume mounts
- **Persistent data**: Database storage with automatic backups
- **Security**: Non-root user, minimal attack surface
- **Auto-restart**: Unless manually stopped

Key features:
```yaml
# Host networking required for accurate system monitoring
network_mode: host             # Essential for network interface detection
volumes:
  - /proc:/host/proc:ro        # Host process info
  - /sys:/host/sys:ro          # Host system info
  - /dev:/dev:ro               # Device info
  - /:/hostfs:ro               # Host filesystem
```

---

### 🖥️ SystemD Service (Linux)

Create and manage NodePuls as a system service:

```bash
# Create service file
sudo nano /etc/systemd/system/NodePuls.service

# Service configuration
[Unit]
Description=NodePuls - Homelab Monitoring Dashboard
After=network.target

[Service]
Type=simple
User=homelab
WorkingDirectory=/opt/NodePuls
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3020

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable NodePuls
sudo systemctl start NodePuls
```

---

### ⚡ PM2 Process Manager

For advanced process management with monitoring and clustering:

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server/index.js --name NodePuls

# Setup auto-restart on boot
pm2 startup
pm2 save

# Monitor processes
pm2 monit
```

---

## 🛠️ Development

### 👨‍💻 Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/smrini/NodePuls.git
cd NodePuls

# Install dependencies (cross-platform)
npm run install:all

# Start development with hot reload (recommended)
npm run dev:watch
```

### 🔄 Development Workflow

```bash
# Clean start (if having issues)
npm run clean && npm run build

# Test your changes
npm test

# Run production build test
npm run start:prod
```

### 📝 Code Standards

- **TypeScript**: Use TypeScript for all React components
- **ESLint**: Follow existing linting rules
- **Comments**: Add JSDoc comments for functions
- **Testing**: Include tests for new features
- **Documentation**: Update README for API changes

### 🏗️ Code Architecture

- **Single Port Design**: Both API and frontend served from port 3020 using Express static middleware
- **Real-time Communication**: Socket.IO for live system updates and website status
- **Modular Services**: Separate classes for system monitoring, uptime checking, and database operations
- **TypeScript Frontend**: Strongly typed React components with proper interfaces
- **SQLite Storage**: Lightweight database with structured schema for websites and history
- **Docker Optimized**: Multi-stage builds with Alpine Linux for minimal production images
- **Environment Flexibility**: Centralized configuration supporting development/production modes
- **Cross-Platform Build**: Node.js-based build scripts work on Windows, macOS, and Linux

### 🔧 Key Components

1. **SystemMonitor**: Collects CPU, memory, disk, network, and temperature data using `systeminformation`
2. **UptimeMonitor**: Manages website checks with health scoring, unique ID generation, and 3-tier checking
3. **DatabaseService**: Handles SQLite operations with migrations, website ordering, and history management
4. **Dashboard**: React component with import/export, drag-and-drop, and real-time data visualization
5. **ResourceCharts**: Interactive charts showing system performance with 50-point history
6. **WebsiteMonitor**: Advanced monitoring with JSON import/export and persistent drag-and-drop ordering

---

## 🐛 Troubleshooting

### 🔧 Common Issues & Solutions

#### **🚨 "React app not built" Error**
```bash
# 🔍 Issue: Accessing http://localhost:3020 shows API endpoints instead of dashboard

# ✅ Solution: Build the React application first
npm run build                # New cross-platform build process
# OR clean build if having issues
npm run clean && npm run build

# 🔍 Check if build was successful
ls -la server/public/        # Should contain index.html and static/ folder
```

#### **🔧 Build Issues (Cross-Platform)**
```bash
# 🔍 Issue: Build failing or files not copying correctly

# ✅ Solution: Use the new cross-platform build system
npm run clean               # Clean old build artifacts
npm run build:client        # Build React app only
npm run build:copy          # Copy files using Node.js script (works on all OS)

# 🔍 Verify build process
npm run build               # Full build process with detailed logging
```

#### **🗄️ Database Connection Errors**
```bash
# 🔍 Issue: SQLite permission denied or database errors

# ✅ Solution: Ensure database directory exists and is writable
mkdir -p server/data
chmod 755 server/data
# In Docker, this is handled by the Dockerfile

# 🔍 Check database file
ls -la server/data/homelab.db
```

#### **🐳 System Monitoring Not Working in Docker**
```bash
# 🔍 Issue: System stats show container metrics instead of host

# ✅ Solution: Ensure proper volume mounts and host networking
network_mode: host             # Required for network interface detection
volumes:
  - /proc:/host/proc:ro
  - /sys:/host/sys:ro
  - /dev:/dev:ro
  - /:/hostfs:ro
# Note: Host networking is essential for accurate network monitoring
```

#### **🎯 Website False "Down" Alerts**
```bash
# 🔍 Issue: External sites like Google or Cloudflare showing as "Down" intermittently

# ✅ Solution: NodePuls now uses advanced health scoring system
# - Health score prevents single failures from marking sites down
# - 3-tier checking (HEAD → GET → Retry) eliminates false positives
# - Sites need multiple consecutive failures AND low health score to be marked down

# 🔍 To verify the monitoring logic is working:
# Check console logs for detailed monitoring attempts
# Health scores visible in dashboard tooltips
# Consider increasing timeout if needed:
WEBSITE_CHECK_TIMEOUT=15000     # Increase from 10s to 15s if needed
```
```bash
# 🔍 Issue: Real-time updates not working, connection errors

# ✅ Solution: Check CORS configuration and port settings
# CORS_ORIGIN is auto-generated based on PORT if not specified
PORT=3020
NODE_ENV=production

# 🔍 Check browser console for WebSocket errors
# F12 → Console → Look for Socket.IO connection errors
```

#### **⚙️ Native Dependency Build Failures (sqlite3)**
```bash
# 🔍 Issue: npm install fails with node-gyp errors

# ✅ Solution: Install build dependencies
# Windows: 
npm install --global windows-build-tools
# Linux: 
apt-get install python3 make g++
# macOS: 
xcode-select --install
```

#### **📈 Charts Not Scaling Properly**
```bash
# 🔍 Issue: Response time charts showing tiny bars or poor scaling

# ✅ Solution: Charts now use adaptive thresholds per website
# - Each website gets custom performance thresholds
# - Minimum bar height ensures visibility for fast sites
# - Dynamic scaling adapts to each site's characteristics

# 🔍 Features of new chart system:
# - Green: ≤ 70% of average response time (min 100ms)
# - Orange: ≤ 150% of average response time (min 200ms)  
# - Red: > 150% of average response time
# - Automatic minimum height for visibility
```

#### **🐳 Docker Build Failures (Python distutils)**
```bash
# 🔍 Issue: Docker build fails with "ModuleNotFoundError: No module named 'distutils'"

# ✅ Solution: The Dockerfile has been updated to include python3-dev and py3-setuptools
# Simply rebuild with no cache:
sudo docker-compose build --no-cache

# 🔧 Quick rebuild script (Linux/macOS):
chmod +x rebuild-docker.sh
./rebuild-docker.sh

# 🔍 If still failing, check Alpine Linux version compatibility
docker --version
```

#### **📥 Website Import Issues**
```bash
# 🔍 Issue: Import fails after a few websites with "UNIQUE constraint failed" error

# ✅ Solution: Fixed with enhanced ID generation system
# - Uses timestamp + counter + random number for unique IDs
# - Prevents collisions during rapid imports
# - All 10+ websites now import successfully

# 🔍 Example import format:
[
  {"name": "Google", "url": "https://www.google.com"},
  {"name": "Home Assistant", "url": "http://ha.home.local"},
  {"name": "Nextcloud", "url": "http://cloud.home.local"}
]
```

#### **🔧 Docker Container Troubleshooting**
```bash
# 🛠️ Use the troubleshooting script:
chmod +x troubleshoot.sh
./troubleshoot.sh

# 🔍 Manual troubleshooting steps:
# Check container status
sudo docker-compose ps

# View container logs
sudo docker-compose logs -f

# Test API endpoint
curl http://localhost:3020/api/health

# Check if React build exists in container
sudo docker-compose exec nodepuls ls -la server/public/index.html
```

### 📊 Performance Optimization

- **Reduce monitoring frequency**: Set `MONITOR_INTERVAL=10000` (10 seconds) for less CPU usage
- **Limit chart data**: React components keep only 50 data points for smooth performance
- **Database cleanup**: `CLEANUP_INTERVAL=24` removes old history entries automatically
- **Docker networking**: Host networking required for accurate system and network monitoring

### 🔍 Debugging

Enable debug logging:
```bash
LOG_LEVEL=debug
ENABLE_DEBUG_LOGGING=true
```

Check container health:
```bash
docker compose ps
docker compose logs nodepuls
```

Monitor system resources:
```bash
# Check memory usage
ps aux | grep node

# Monitor in real-time
htop
```

---

## 🔒 Security & Best Practices

### 🛡️ Production Security

```env
# Essential security settings
NODE_ENV=production
ENABLE_HELMET=true           # Security headers
TRUST_PROXY=false           # Behind reverse proxy
```

### 🔥 Firewall Configuration

```bash
# Ubuntu UFW
sudo ufw allow ssh
sudo ufw allow 3020/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3020/tcp
sudo firewall-cmd --reload
```

### 🧹 Maintenance

```env
# Automated cleanup configuration
CLEANUP_INTERVAL=24         # Clean old data every 24 hours
MAX_HISTORY_ENTRIES=100     # Keep last 100 chart points
```

```bash
# Manual maintenance commands
df -h                       # Check disk usage
ps aux | grep node          # Monitor NodePuls process
cp server/data/homelab.db server/data/homelab.db.backup  # Backup database
```

---

## 🤝 Contributing

### � Before Contributing

- 📖 **Read the [CHANGELOG.md](CHANGELOG.md)** to understand recent changes
- 🔍 **Check [GitHub Issues](https://github.com/smrini/NodePuls/issues)** for known issues or feature requests
- 💡 **Open an issue** to discuss major changes before starting work

### �🔄 Pull Request Process

1. **Update Documentation**: Update README if needed
2. **Test Changes**: Ensure all functionality works
3. **TypeScript Compilation**: `cd client && npm run build`
4. **Docker Testing**: `docker compose up --build`
5. **Clear Description**: Explain what your PR does and why

### Development Guidelines

- Follow TypeScript best practices for React components
- Use proper interfaces defined in `client/src/types.ts`
- Test both development and production builds
- Update documentation for any API or configuration changes
- Ensure Docker compatibility for all changes

---

## 📞 Support & Contact

### 💬 Getting Help

- 📖 **Documentation**: This comprehensive README
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/smrini/NodePuls/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/smrini/NodePuls/discussions)

### 🌟 Show Your Support

If NodePuls helps you monitor your homelab, consider:
- ⭐ **Starring** the repository
- 🐛 **Reporting** bugs you find
- 💡 **Suggesting** new features
- 🤝 **Contributing** code improvements
- 📢 **Sharing** with the homelab community

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

**Copyright © 2025 Said Mrini**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

---

## 🙏 Acknowledgments

- [**systeminformation**](https://www.npmjs.com/package/systeminformation) - Comprehensive system monitoring library
- [**Socket.IO**](https://socket.io/) - Real-time bidirectional event-based communication
- [**Recharts**](https://recharts.org/) - Composable charting library built on React components
- [**React**](https://reactjs.org/) - Modern frontend framework with hooks and TypeScript
- [**Express**](https://expressjs.com/) - Fast, unopinionated, minimalist web framework
- [**SQLite**](https://sqlite.org/) - Lightweight, file-based SQL database engine
- [**Lucide React**](https://lucide.dev/) - Beautiful & consistent icon library
- [**React DnD**](https://react-dnd.github.io/react-dnd/) - Drag and drop functionality

---

<div align="center">

**NodePuls** - *Beautiful homelab monitoring made simple* 🚀

Built with ❤️ by [Said Mrini](https://github.com/smrini)

[⬆️ Back to Top](#nodepuls-)

</div>

---
