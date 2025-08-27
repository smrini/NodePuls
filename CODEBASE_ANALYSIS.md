# NodePuls - Code Analysis Summary

This document provides a comprehensive analysis of the NodePuls codebase based on actual implementation details found in all project files.

## Architecture Overview

### Single Port Design
- **Port 3020**: Serves both API and frontend from the same Express server
- **Static Serving**: React build files are copied to `server/public/` and served via Express static middleware
- **WebSocket**: Socket.IO runs on the same port for real-time communication
- **API Routes**: All API endpoints are prefixed with `/api/`

### File Structure & Build Process
```
Root package.json scripts:
- npm run build: Builds React app and copies to server/public/
- npm run dev:watch: Hot reload development with concurrent build watching
- npm start: Starts production server (requires pre-built React app)
- npm run install:all: Installs dependencies for both root and client
```

### Environment Configuration
The project uses a sophisticated environment loading system via `env-loader.js`:

**Priority Order (highest to lowest):**
1. System environment variables (Docker/runtime)
2. Local .env files (client/.env, server/.env)  
3. Root .env file

**Key Features:**
- Auto-generates React environment variables from main variables
- Centralized configuration through `config.js`
- 316+ configuration options in `.env.example`
- Docker-aware path detection for host monitoring

## Database Architecture

### SQLite Implementation
- **Location**: `server/data/homelab.db`
- **Tables**: 
  - `websites`: Main website configuration and status
  - `website_history`: Historical uptime/response time data
- **Migrations**: Automatic schema updates (e.g., `up_since` column addition)
- **Cleanup**: Automatic old data removal based on `CLEANUP_INTERVAL`

### Data Persistence
- Website configurations persist across restarts
- Historical data for uptime tracking and charts
- In-memory caching for quick access (`Map` objects)

## Monitoring Systems

### System Monitoring (`systemMonitor.js`)
**Capabilities:**
- CPU usage, load, cores, speed, temperature
- Memory total/used/free/percentage
- Disk usage for multiple drives
- Network interface statistics (rx/tx rates)
- Docker-aware host system monitoring

**Docker Integration:**
- Detects Docker environment via `/.dockerenv` or cgroup analysis
- Supports host-mounted paths (`/host/proc`, `/host/sys`)
- Fallback to container-local data if host mounts unavailable

### Website Monitoring (`uptimeMonitor.js`)
**Features:**
- TCP connection time measurement (ping-like)
- HTTP response time and status checking
- Configurable timeout and retry logic
- Historical tracking with SQLite storage
- Uptime percentage calculation
- WebSocket-based real-time updates

**Check Process:**
1. TCP connection time measurement
2. HTTP GET request with axios
3. Status determination (up/down based on HTTP status)
4. Database storage of results
5. Real-time broadcast via Socket.IO

## Frontend Architecture

### React 19 + TypeScript
**Components:**
- `Dashboard.tsx`: Main orchestrator component
- `SystemStats.tsx`: System metrics display with dropdowns
- `ResourceCharts.tsx`: Real-time charts (50-point history)
- `WebsiteMonitor.tsx`: Website status and management
- `ConnectionStatus.tsx`: WebSocket connection indicator

**Key Features:**
- TypeScript interfaces in `types.ts`
- Real-time data via Socket.IO client
- Drag & drop website reordering (React DnD)
- Responsive design with mobile support
- Interactive charts with Recharts

### Data Flow
1. WebSocket connection established on app load
2. Server sends initial data (`systemUpdate`, `websites`)
3. Real-time updates every 5 seconds (configurable)
4. User interactions sent via WebSocket events
5. Chart data limited to 50 points for performance

## Docker Configuration

### Multi-Stage Build
**Stage 1 (Builder):**
- Node.js 20 Alpine with build tools (python3, make, g++)
- Installs all dependencies
- Builds React application
- Copies built files to `server/public/`

**Stage 2 (Production):**
- Minimal Node.js 20 Alpine runtime
- No build tools (removed for security)
- Non-root `nodejs` user
- Health check with wget

### Host System Access
**Required Volume Mounts:**
- `/proc:/host/proc:ro` - Process information
- `/sys:/host/sys:ro` - System information  
- `/dev:/dev:ro` - Device information
- `/:/hostfs:ro` - Host filesystem

**Security Capabilities:**
- `SYS_PTRACE`: Process monitoring
- `DAC_READ_SEARCH`: System file access
- `NET_RAW`: Network monitoring
- `network_mode: host`: Required for accurate network stats
- `pid: host`: Host PID namespace access

## API Specification

### REST Endpoints
```
GET  /api/health       - Health check
GET  /api/config       - Client configuration
GET  /api/system       - Current system metrics
GET  /api/websites     - All websites with history
POST /api/websites     - Add website {name, url}
DELETE /api/websites/:id - Remove website
```

### WebSocket Events
**Server → Client:**
- `systemUpdate`: Real-time metrics every 5s
- `websites`: Updated website list after changes

**Client → Server:**
- `addWebsite`: Add new website
- `removeWebsite`: Remove website  
- `updateWebsite`: Edit website details
- `updateWebsiteOrder`: Drag & drop reordering
- `clearWebsiteHistory`: Clear historical data

## Configuration Options

### Critical Settings
- `PORT=3020`: Single port for all services
- `NODE_ENV=production`: Environment mode
- `DB_PATH`: SQLite database location
- `MONITOR_INTERVAL=5000`: System monitoring frequency
- `CORS_ORIGIN`: Auto-generated if not specified

### Performance Tuning
- `COMPRESSION_LEVEL=6`: Gzip compression
- `REQUEST_TIMEOUT=10000`: Request timeout
- `MAX_CONNECTIONS=100`: Connection limit
- `MAX_HISTORY_ENTRIES=100`: Chart data limit

### Feature Flags
- `ENABLE_CPU_TEMPERATURE=true`
- `ENABLE_DISK_IO_MONITORING=true`  
- `ENABLE_PROCESS_MONITORING=true`
- `ENABLE_HELMET=true`: Security headers

## Running Options Summary

### Development
```bash
npm run dev:watch    # Hot reload with build watching
npm run dev          # Build once + start server
npm run server       # Server only (requires pre-built client)
```

### Production
```bash
npm run build        # Build React app
npm start           # Start production server
npm run start:prod  # Build + start in one command
```

### Docker
```bash
docker compose up --build  # Complete Docker deployment
```

## Common Issues & Solutions

### Build Issues
- **Missing React build**: Run `npm run build` before `npm start`
- **Native dependencies**: Requires python3, make, g++ for sqlite3
- **Windows build tools**: Use `npm install --global windows-build-tools`

### Docker Issues  
- **System monitoring not working**: Ensure proper volume mounts and host networking
- **Permission denied**: Check file ownership and container capabilities
- **Network stats incorrect**: Requires `network_mode: host`

### Database Issues
- **SQLite errors**: Ensure `server/data/` directory exists and is writable
- **Migration failures**: Database service handles schema updates automatically

## Performance Characteristics

### Resource Usage
- **Memory**: ~50-100MB typical usage
- **CPU**: <5% with default 5-second monitoring
- **Disk**: Minimal, only SQLite database growth
- **Network**: WebSocket connections + monitoring traffic

### Scalability
- **Chart Data**: Limited to 50 points for browser performance
- **Website History**: Configurable cleanup (default 24 hours)
- **Concurrent Users**: Limited by single Node.js process
- **Monitoring Frequency**: Configurable (minimum 1 second)

This analysis is based on the actual codebase implementation as of the analysis date and reflects the true capabilities and limitations of the NodePuls system.
