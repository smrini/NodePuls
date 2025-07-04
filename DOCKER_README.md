# Docker Deployment Guide

This guide explains how to deploy the Homelab Dashboard using Docker on your Ubuntu server.

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
    - The dashboard should be running and monitoring your system

## Configuration

### Environment Variables

The application uses environment variables defined in `docker-compose.yml`. Key settings:

-   `PORT=3020` - The port the application runs on
-   `NODE_ENV=production` - Production environment
-   `DB_PATH=/usr/src/app/server/data/homelab.db` - SQLite database location
-   `CORS_ORIGIN` - Allowed origins for CORS

### Custom Configuration

To customize the configuration:

1. Edit the environment variables in `docker-compose.yml`
2. Or create a custom `.env.docker` file
3. Restart the container: `docker-compose down && docker-compose up -d`

## Data Persistence

The SQLite database is stored in a Docker volume named `homelab-data`. This ensures your data persists across container restarts and updates.

## System Monitoring

The container mounts `/proc` and `/sys` from the host system (read-only) to enable system monitoring features:

-   CPU usage and temperature
-   Memory usage
-   Disk space
-   Network statistics

## Security Considerations

-   The application runs as a non-root user (nodejs:1001)
-   Host system directories are mounted read-only
-   The container is not privileged
-   Helmet.js is enabled for security headers

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

## Troubleshooting

### Check container status

```bash
docker-compose ps
```

### View detailed logs

```bash
docker-compose logs homelab-dashboard
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
```

## Network Configuration

By default, the application runs on port 3020. To change the port:

1. Edit the `ports` section in `docker-compose.yml`:

    ```yaml
    ports:
        - "YOUR_PORT:3020"
    ```

2. Update the `CORS_ORIGIN` environment variable accordingly

3. Restart: `docker-compose down && docker-compose up -d`

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
