# Single Port Setup Guide

This project has been modified to use a **single port** for both development and production environments.

## How It Works

### Development Mode
- React app is built and served as static files by the Express server
- No separate React development server
- Uses one port (default: 3020) for everything

### Production Mode
- Same as development - single port serves both API and frontend

## Commands

### Start Development
```powershell
# Build React app and start server
npm run dev

# For automatic rebuild on changes
npm run dev:watch
```

### Start Production
```powershell
npm run start:prod
```

## Configuration

Only **one port** needs to be configured in `.env`:
```env
PORT=3020
```

The `CLIENT_PORT` variable is no longer needed or used.

## Benefits

1. **Simpler deployment** - only one port to expose
2. **Easier configuration** - no port conflicts
3. **Production-like development** - same setup in both environments
4. **Better CORS handling** - no cross-origin issues

## Development Workflow

1. Make changes to React components in `client/src/`
2. Run `npm run build` to rebuild the React app
3. Server automatically serves the updated files
4. For continuous development, use `npm run dev:watch`

## Port Access

- **Frontend**: http://localhost:3020
- **API**: http://localhost:3020/api/*
- **WebSocket**: http://localhost:3020 (Socket.IO)

Everything is served from the same port!
