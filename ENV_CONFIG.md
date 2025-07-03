# Environment Configuration Guide

## Overview

The Homelab Dashboard now uses a centralized environment configuration system that allows you to manage all settings from a single location while maintaining the flexibility to override specific settings for client and server components.

## Configuration Files

### 1. Main Configuration (`.env`)

The root `.env` file contains all shared configuration settings. This is the primary configuration file.

### 2. Client Configuration (`client/.env`)

Contains React-specific environment variables that override or supplement the main configuration.

### 3. Server Configuration (`server/.env`)

Contains server-specific environment variables that override or supplement the main configuration.

## Setup Methods

### Method 1: Interactive Setup (Recommended)

Run the interactive setup wizard to generate your configuration files:

```bash
npm run setup-env
```

This will guide you through setting up all the necessary environment variables.

### Method 2: Manual Setup

1. Copy the example files:

    ```bash
    cp .env.example .env
    cp client/.env.example client/.env
    cp server/.env.example server/.env
    ```

2. Edit the files to match your requirements.

### Method 3: Quick Start

Use the default `.env` file that's already created, which contains sensible defaults for development.

## Configuration Priority

Environment variables are loaded in this order (highest priority first):

1. System environment variables
2. Local `.env` files (`client/.env` or `server/.env`)
3. Root `.env` file

## Available Configuration Options

### Server Settings

-   `PORT` - Server port (default: 3050)
-   `NODE_ENV` - Environment mode (development/production)
-   `CORS_ORIGIN` - CORS origin for API requests

### Client Settings

-   `CLIENT_PORT` - React development server port (default: 3000)
-   `REACT_APP_API_BASE_URL` - API base URL
-   `REACT_APP_SOCKET_URL` - WebSocket URL
-   `REACT_APP_CHART_UPDATE_INTERVAL` - Chart update interval in ms
-   `REACT_APP_DEFAULT_TIME_RANGE` - Default time range for charts in minutes

### Database Settings

-   `DB_PATH` - SQLite database file path

### Monitoring Settings

-   `SYSTEM_UPDATE_INTERVAL` - System monitoring update interval in ms
-   `WEBSITE_CHECK_TIMEOUT` - Website check timeout in ms
-   `ENABLE_CPU_TEMPERATURE` - Enable CPU temperature monitoring
-   `ENABLE_DISK_IO_MONITORING` - Enable disk I/O monitoring
-   `ENABLE_PROCESS_MONITORING` - Enable process monitoring
-   `DEFAULT_WEBSITES` - JSON array of websites to monitor

### Security Settings

-   `ENABLE_HELMET` - Enable Helmet security middleware
-   `TRUST_PROXY` - Trust proxy headers
-   `ENABLE_HTTPS_REDIRECT` - Enable HTTPS redirect

### Logging Settings

-   `LOG_LEVEL` - Logging level (info, debug, error)
-   `ENABLE_DEBUG_LOGGING` - Enable debug logging

## Validation

Validate your configuration after making changes:

```bash
npm run validate-env
```

This will check all configuration values and report any issues.

## Environment-Specific Configurations

### Development

```env
NODE_ENV=development
PORT=3050
CLIENT_PORT=3000
REACT_APP_API_BASE_URL=http://localhost:3050
CORS_ORIGIN=http://localhost:3000
```

### Production

```env
NODE_ENV=production
PORT=3050
REACT_APP_API_BASE_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### Docker

```env
DB_PATH=/app/data/homelab.db
PROC_PATH=/proc
SYS_PATH=/sys
```

## Security Notes

1. Never commit `.env` files to version control
2. Use `.env.example` files to document required variables
3. Keep sensitive data in environment variables, not in code
4. Use different configurations for different environments

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change `PORT` or `CLIENT_PORT` if default ports are in use
2. **API connection issues**: Verify `REACT_APP_API_BASE_URL` matches your server URL
3. **Database issues**: Ensure `DB_PATH` directory exists and is writable
4. **CORS errors**: Set `CORS_ORIGIN` to match your client URL

### Debug Steps

1. Run `npm run validate-env` to check configuration
2. Check console output for environment loading messages
3. Verify `.env` files exist and have correct syntax
4. Ensure environment variables are properly formatted (no spaces around `=`)

## Examples

### Basic Development Setup

```env
# Main .env file
PORT=3050
NODE_ENV=development
CLIENT_PORT=3000
REACT_APP_API_BASE_URL=http://localhost:3050
DB_PATH=./server/data/homelab.db
```

### Production with Custom Domain

```env
# Main .env file
PORT=80
NODE_ENV=production
REACT_APP_API_BASE_URL=https://dashboard.example.com
CORS_ORIGIN=https://dashboard.example.com
ENABLE_HTTPS_REDIRECT=true
```

### High-Frequency Monitoring

```env
# Main .env file
SYSTEM_UPDATE_INTERVAL=1000
REACT_APP_CHART_UPDATE_INTERVAL=1000
ENABLE_CPU_TEMPERATURE=true
ENABLE_DISK_IO_MONITORING=true
```
