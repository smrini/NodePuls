# Docker Deployment Guide

This guide explains how to deploy the Homelab Dashboard using Docker with the new **single-port architecture**.

## Key Features

- **Single Port Setup** - Everything runs on one port (3020 by default)
- **Production Ready** - Multi-stage Docker build with security best practices
- **System Monitoring** - Full access to host system metrics
- **Persistent Data** - SQLite database with Docker volume persistence

## Prerequisites

-   Docker installed on your Ubuntu server
-   Docker Compose installed
-   Sufficient disk space for the application and database

## Quick Start

1. **Clone/Copy the project** to your Ubuntu server:

    ```bash
    # If using git
    git clone <your-repo-url>
    cd ServerDashboard

    # Or copy the files to your server
    ```

2. **Build and start the application**:

    ```bash
    docker-compose up -d
    ```

3. **Access the dashboard**:
    - Open your browser and navigate to `http://your-server-ip:3020`
    - The dashboard serves both the frontend and API from the same port

## Single Port Architecture

The application now uses a **unified single-port setup**:
- **Frontend**: Served as static files from the Express server
- **API**: Available at `/api/*` endpoints  
- **WebSocket**: Real-time updates via Socket.IO
- **All on port 3020** (configurable via PORT environment variable)

## Configuration

### Environment Variables

The application uses environment variables defined in `docker-compose.yml`. Key settings:

-   `PORT=3020` - The single port for all services
-   `NODE_ENV=production` - Production environment
-   `DB_PATH=/usr/src/app/server/data/homelab.db` - SQLite database location
-   `CORS_ORIGIN` - CORS configuration (auto-configured for single port)

### Custom Configuration

### Custom Configuration

To customize the configuration:

1. **Option 1**: Edit environment variables in `docker-compose.yml`
2. **Option 2**: Create a custom `.env.docker` file and mount it
3. **Option 3**: Override via command line: `docker-compose up -d -e PORT=4020`
4. Restart the container: `docker-compose down && docker-compose up -d`

### Port Configuration

To change the port (default: 3020):

1. **Update docker-compose.yml**:
   ```yaml
   environment:
     - PORT=4020  # Your desired port
   ports:
     - "4020:4020"  # Update port mapping
   ```

2. **Restart**: `docker-compose down && docker-compose up -d`

## Data Persistence

The SQLite database is stored in a Docker volume named `homelab-data`. This ensures your data persists across container restarts and updates.

**Volume location**: `/usr/src/app/server/data/homelab.db`

## System Monitoring

The container requires elevated privileges to monitor the host system:

**Mounted Directories:**
-   `/proc` - Process and system information
-   `/sys` - System hardware information  
-   `/dev` - Device information

**Monitoring Features:**
-   CPU usage and temperature
-   Memory usage and swap
-   Disk space and I/O
-   Network statistics
-   Process monitoring

## Security Considerations

⚠️ **High Privilege Container**: This container runs with extensive privileges for system monitoring:

-   `privileged: true` - Full container privileges
-   `pid: host` - Access to host process tree
-   Host directory mounts with read/write access
-   All Linux capabilities enabled

**Security Measures:**
-   Application runs as non-root user (`nodejs`)
-   Helmet.js enabled for HTTP security headers
-   CORS properly configured
-   Regular security updates recommended

## Useful Commands

### Start the application

```bash
docker-compose up -d
```

### Stop the application

```bash
docker-compose down
```

### View logs

```bash
docker-compose logs -f homelab-dashboard
```

### Restart the application

```bash
docker-compose restart homelab-dashboard
```

### Update the application

```bash
# Pull new code/rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup database

```bash
# The database is stored in a Docker volume
docker run --rm -v homelab-data:/data -v $(pwd):/backup alpine cp /data/homelab.db /backup/
```

### Restore database

```bash
# Restore from backup
docker run --rm -v homelab-data:/data -v $(pwd):/backup alpine cp /backup/homelab.db /data/
```

### Rebuild after code changes

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Check application health

```bash
# Health check endpoint
curl http://localhost:3020/api/health

# Or using docker command
docker-compose exec homelab-dashboard wget --spider http://localhost:3020/api/health
```

## Single Port Benefits

### ✅ **Simplified Deployment**
- Only one port to expose through firewall
- No complex port mapping or proxying needed
- Easier reverse proxy configuration

### ✅ **No CORS Issues**
- Frontend and API on same origin
- No cross-origin request complications
- Simplified security configuration

### ✅ **Production-like Development**
- Same architecture in all environments
- Consistent behavior between dev and prod
- Better testing of production deployment

### ✅ **Container Efficiency**
- Single container handles everything
- Reduced complexity in orchestration
- Lower resource overhead

## Troubleshooting

### Check container status

```bash
docker-compose ps
```

### View detailed logs

```bash
# All logs
docker-compose logs homelab-dashboard

# Follow logs in real-time
docker-compose logs -f homelab-dashboard

# Last 100 lines
docker-compose logs --tail=100 homelab-dashboard
```

### Access container shell

```bash
docker-compose exec homelab-dashboard sh
```

### Check system resources

```bash
docker stats homelab-dashboard
```

### Verify database

```bash
# Check if database file exists
docker-compose exec homelab-dashboard ls -la /usr/src/app/server/data/

# Check database size
docker-compose exec homelab-dashboard du -h /usr/src/app/server/data/homelab.db
```

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3020

# Change port in docker-compose.yml
```

**2. Permission Issues**
```bash
# Check container user
docker-compose exec homelab-dashboard id

# Check file permissions
docker-compose exec homelab-dashboard ls -la /usr/src/app/server/data/
```

**3. Health Check Failing**
```bash
# Manual health check
docker-compose exec homelab-dashboard wget --spider http://localhost:3020/api/health

# Check application logs
docker-compose logs homelab-dashboard | grep -i error
```

## Network Configuration

The application uses a single port (3020 by default) for all services:

- **Frontend**: `http://localhost:3020`
- **API**: `http://localhost:3020/api/*`
- **WebSocket**: `http://localhost:3020` (Socket.IO)

### Change Port

1. Edit `docker-compose.yml`:
    ```yaml
    environment:
        - PORT=4020  # Your desired port
    ports:
        - "4020:4020"  # Update port mapping
    ```

2. Restart: `docker-compose down && docker-compose up -d`

## Performance Tuning

For better performance on your Ubuntu server:

1. **Adjust monitoring intervals** in `docker-compose.yml`:

    - `SYSTEM_UPDATE_INTERVAL` - How often to collect system stats
    - `WEBSITE_CHECK_INTERVAL` - How often to check website uptime

2. **Limit history retention**:

    - `MAX_HISTORY_LENGTH` - Number of system stats to keep
    - `MAX_WEBSITE_HISTORY` - Number of website checks to keep

3. **Enable/disable features** based on your needs:
    - `ENABLE_CPU_TEMPERATURE`
    - `ENABLE_DISK_IO_MONITORING`
    - `ENABLE_PROCESS_MONITORING`

## Updating

To update the application:

1. Pull the latest code
2. Rebuild the Docker image:
    ```bash
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    ```

Your data will be preserved in the Docker volume.
