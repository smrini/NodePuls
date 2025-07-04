# Port Configuration Guide

## Centralized Port Management

Your Homelab Dashboard now has centralized port management! You can easily change both server and client ports with a single command.

## Current Configuration

- **Server Port**: 3050 (configurable via `PORT` environment variable)
- **Client Port**: 3020 (configurable via `CLIENT_PORT` environment variable)

## How to Change Ports

### Method 1: Using the Update Script (Recommended)

```bash
# Change both server and client ports
npm run update-ports 4000 4001

# Change only server port (client port stays the same)
npm run update-ports 4000

# Reset to defaults
npm run update-ports
```

This script automatically updates:
- `.env` file
- `.env.example` file
- `server/.env` file
- `server/.env.example` file
- `client/.env.example` file

### Method 2: Manual Configuration

1. Update the main `.env` file:
   ```env
   PORT=4000                           # Server port
   SERVER_PORT=4000                    # Server port (for client reference)
   CLIENT_PORT=4001                    # Client port
   REACT_APP_SERVER_PORT=4000          # Server port for React client
   REACT_APP_API_BASE_URL=http://localhost:4000
   REACT_APP_SOCKET_URL=http://localhost:4000
   ```

2. Restart your development servers:
   ```bash
   npm run dev
   ```

## Environment Variables Used

### Server Configuration
- `PORT` - Main server port
- `SERVER_PORT` - Server port reference
- `NODE_ENV` - Environment mode

### Client Configuration
- `CLIENT_PORT` - React development server port
- `REACT_APP_SERVER_PORT` - Server port for API calls
- `REACT_APP_API_BASE_URL` - Base URL for API calls
- `REACT_APP_SOCKET_URL` - WebSocket connection URL

## File Structure

The port configuration affects these files:
```
├── .env                    # Main environment configuration
├── .env.example           # Environment template
├── config.js              # Centralized configuration loader
├── update-ports.js        # Port update utility
├── server/
│   ├── .env              # Server-specific environment
│   └── .env.example      # Server environment template
└── client/
    ├── .env.example      # Client environment template
    ├── start-client.js   # Client startup script
    └── src/App.tsx       # React app with dynamic port configuration
```

## Benefits

1. **Single Source of Truth**: All ports are managed from the main `.env` file
2. **Dynamic Configuration**: The React client automatically uses the correct server port
3. **Easy Updates**: Change ports across all files with one command
4. **Environment Flexibility**: Different ports for development, testing, and production

## Troubleshooting

If you encounter issues after changing ports:

1. **Clear browser cache** and reload the page
2. **Restart the development servers**:
   ```bash
   npm run dev
   ```
3. **Check that all ports are available** (not used by other applications)
4. **Verify environment variables** are loaded correctly:
   ```bash
   npm run validate-env
   ```

## Examples

### Development Setup
```bash
# Server on 3050, Client on 3020 (default)
npm run update-ports 3050 3020
npm run dev
```

### Testing Setup
```bash
# Server on 4000, Client on 4001
npm run update-ports 4000 4001
npm run dev
```

### Production Setup
The production build automatically uses relative URLs, so port configuration is mainly for development.
