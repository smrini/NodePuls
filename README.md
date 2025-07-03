# Homelab Dashboard

A lightweight, real-time server monitoring dashboard built with Node.js and React. Perfect for monitoring your homelab servers with minimal resource usage.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Homelab+Dashboard+Preview)

## ✨ Features

-   **Real-time System Monitoring**: CPU, RAM, disk usage, and network activity
-   **Website Uptime Monitoring**: Track multiple websites with response times
-   **Modern UI**: Clean, dark theme similar to Grafana/Netdata
-   **WebSocket Updates**: Live data updates without page refreshes
-   **Responsive Design**: Works on desktop, tablet, and mobile
-   **Easy Deployment**: Simple setup with npm scripts
-   **Lightweight**: Minimal resource usage perfect for homelab environments

## 🛠 Tech Stack

-   **Backend**: Node.js, Express.js, Socket.IO
-   **Frontend**: React, TypeScript, Recharts
-   **Monitoring**: systeminformation, axios

## 🚀 Quick Start

### Development Setup

1. Clone and install dependencies:

    ```bash
    git clone <repository-url>
    cd homelab-dashboard
    npm install
    ```

2. Configure environment:

    ```bash
    cp .env.example .env
    # Edit .env file with your preferences
    npm run validate-env # Validate your configuration
    ```

3. Start development servers:

    ```bash
    npm run dev
    ```

4. Access the dashboard at `http://localhost:3000`

### Production Setup

1. Clone the repository:

    ```bash
    git clone <repository-url> homelab-dashboard
    cd homelab-dashboard
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Configure environment:

    ```bash
    cp .env.production .env
    # Edit .env if needed
    ```

4. Build the client:

    ```bash
    npm run build
    ```

5. Start the production server:

    ```bash
    npm start
    ```

6. Access your dashboard at `http://your-server-ip:3001`

## 📋 System Requirements

-   **Minimum**: 512MB RAM, 1 CPU core
-   **Recommended**: 1GB RAM, 2 CPU cores
-   **Disk Space**: < 100MB
-   **OS**: Linux, macOS, Windows, or any Node.js supported platform

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```

#### Key Configuration Options:

| Variable                 | Default          | Description                              |
| ------------------------ | ---------------- | ---------------------------------------- |
| `PORT`                   | 3001             | Server port                              |
| `NODE_ENV`               | development      | Environment (development/production)     |
| `SYSTEM_UPDATE_INTERVAL` | 5000             | System monitoring interval (ms)          |
| `WEBSITE_CHECK_INTERVAL` | "_/1 _ \* \* \*" | Website check frequency (cron format)    |
| `WEBSITE_CHECK_TIMEOUT`  | 10000            | Website check timeout (ms)               |
| `DEFAULT_WEBSITES`       | `[]`             | Default websites to monitor (JSON array) |
| `MAX_HISTORY_LENGTH`     | 60               | Max chart data points                    |
| `ENABLE_CPU_TEMPERATURE` | true             | Enable CPU temperature monitoring        |

#### Example .env file:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Monitoring Settings
SYSTEM_UPDATE_INTERVAL=5000
WEBSITE_CHECK_INTERVAL="*/1 * * * *"
WEBSITE_CHECK_TIMEOUT=10000

# Website Monitoring
DEFAULT_WEBSITES='[{"name":"Google","url":"https://google.com"},{"name":"GitHub","url":"https://github.com"}]'

# Features
ENABLE_CPU_TEMPERATURE=true
MAX_HISTORY_LENGTH=60
```

#### Configuration Validation

Validate your configuration before starting:

```bash
npm run validate-env
```

## 📊 Monitoring Capabilities

### System Metrics

-   CPU usage percentage and load average
-   Memory usage and availability
-   Disk space utilization
-   Network I/O (upload/download speeds)
-   CPU temperature (if supported)
-   System uptime

### Website Monitoring

-   HTTP/HTTPS response time tracking
-   Status code monitoring
-   Uptime percentage calculation
-   Historical response time charts
-   Real-time status updates

## 🎯 API Endpoints

### System Information

-   `GET /api/system` - Current system stats
-   `GET /api/health` - Health check endpoint

### Website Monitoring

-   `GET /api/websites` - List monitored websites
-   `POST /api/websites` - Add new website to monitor
-   `DELETE /api/websites/:id` - Remove website from monitoring

### WebSocket Events

-   `system-update` - Real-time system metrics
-   `website-update` - Website status updates
-   `connection-status` - Connection state changes

## 🔄 Updates and Maintenance

### Manual Updates

```bash
git pull
npm install
npm run build
npm start
```

### Running as a Service

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server/index.js --name "homelab-dashboard"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Using systemd (Linux)

Create a service file at `/etc/systemd/system/homelab-dashboard.service`:

```ini
[Unit]
Description=Homelab Dashboard
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/homelab-dashboard
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable homelab-dashboard
sudo systemctl start homelab-dashboard
```

## 📁 Project Structure

```
homelab-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Dashboard components
│   │   ├── types.ts        # TypeScript definitions
│   │   └── App.tsx         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── services/           # Monitoring services
│   └── index.js            # Express server
└── package.json            # Root package file
```

## 🐛 Troubleshooting

### Common Issues

**Dashboard not loading:**

-   Check if port 3001 is accessible
-   Verify the server is running: `ps aux | grep node`
-   Check server logs for errors

**System metrics not updating:**

-   Check server logs for monitoring errors
-   Verify WebSocket connection in browser dev tools
-   Ensure proper permissions for system monitoring

**Website monitoring not working:**

-   Check network connectivity
-   Verify website URLs are correct
-   Check firewall settings

### Performance Optimization

**High CPU usage:**

-   Increase `SYSTEM_UPDATE_INTERVAL` (default: 5000ms)
-   Reduce `MAX_HISTORY_LENGTH` (default: 60)
-   Disable CPU temperature monitoring if not needed

**Memory usage:**

-   Monitor with `htop` or similar tools
-   Restart the service periodically if needed
-   Check for memory leaks in logs

## 🔒 Security Considerations

-   Run the application behind a reverse proxy (nginx/Apache)
-   Use HTTPS in production environments
-   Implement authentication if exposed to the internet
-   Keep dependencies updated
-   Monitor system logs for unusual activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

-   Built with React and Node.js
-   System monitoring powered by systeminformation
-   Charts created with Recharts
-   Icons from various open-source projects
