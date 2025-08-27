# NodePuls Client

React frontend for the NodePuls homelab monitoring dashboard.

## 🎨 Features

- **Modern React 19** with TypeScript
- **Real-time Updates** via WebSocket
- **Responsive Design** for all device sizes
- **Animated UI** with pulse effects and gradients
- **Interactive Charts** using Recharts
- **Beautiful Icons** from Lucide React

## 🚀 Development

### Prerequisites
- Node.js 18+
- NPM or Yarn

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start
```

This will start the React development server at `http://localhost:3020`.

## 📦 Available Scripts

### `npm start`
Runs the app in development mode with hot reloading.

### `npm run build`
Builds the app for production to the `build` folder.
- Optimizes React for best performance
- Minifies and hashes filenames
- Ready for deployment

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run eject`
⚠️ **One-way operation!** Ejects from Create React App configuration.

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx     # Main dashboard layout
│   ├── SystemStats.tsx  # System overview cards
│   ├── ResourceCharts.tsx # Performance charts
│   ├── WebsiteMonitor.tsx # Website uptime monitoring
│   └── ConnectionStatus.tsx # WebSocket status
├── types.ts             # TypeScript definitions
├── App.tsx             # Main application component
├── App.css             # Global styles
└── index.tsx           # Application entry point
```

## 🎨 UI Components

### Dashboard
Main layout component with animated NodePuls logo and system monitoring sections.

### SystemStats
Real-time system metrics cards showing CPU, memory, disk, and network usage.

### ResourceCharts
Interactive charts displaying historical performance data with hover effects.

### WebsiteMonitor
Website uptime tracking with response times and status indicators.

### ConnectionStatus
WebSocket connection status with visual indicators.

## 🔧 Configuration

The client automatically inherits configuration from the parent project's environment variables via `env-loader.js`.

Key variables:
- `REACT_APP_SERVER_PORT` - Backend server port
- `REACT_APP_API_BASE_URL` - API endpoint URL
- `REACT_APP_SOCKET_URL` - WebSocket server URL

## 📱 Responsive Design

The UI is optimized for:
- **Desktop**: Full feature set with large charts
- **Tablet**: Adapted layout with touch-friendly controls
- **Mobile**: Compact view with essential metrics

## 🎭 Animations & Theming

- **Dark Theme**: Professional monitoring interface
- **Pulse Animations**: Live data indicators
- **Gradient Effects**: Modern visual design
- **Smooth Transitions**: Enhanced user experience

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📖 Learn More

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Recharts Documentation](https://recharts.org/)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)

---

**Part of NodePuls** - Built with ❤️ by Said Mrini
