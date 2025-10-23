// Load environment variables using centralized loader
const EnvLoader = require("./env-loader");
new EnvLoader(__dirname);

// Helper function to parse environment variables
const parseEnvVar = {
	int: (value, defaultValue) => {
		const parsed = parseInt(value);
		return isNaN(parsed) ? defaultValue : parsed;
	},
	bool: (value, defaultValue) => {
		if (value === undefined) return defaultValue;
		return value.toLowerCase() === "true";
	},
	string: (value, defaultValue) => value || defaultValue,
};

// Logging configuration
const logLevel = parseEnvVar.string(process.env.LOG_LEVEL, process.env.NODE_ENV === "production" ? "info" : "debug");
const enableVerboseLogging = parseEnvVar.bool(process.env.ENABLE_VERBOSE_LOGGING, process.env.NODE_ENV !== "production");

// Get server port for dynamic URL generation
const serverPort = parseEnvVar.int(process.env.PORT, 3020);

// For Docker/single-port setup, use relative URLs that work from browser
let baseUrl, apiBaseUrl, socketUrl;

if (process.env.NODE_ENV === "production") {
	// In production (Docker), use relative URLs - browser will use current origin
	baseUrl = "";  // Relative to current origin
	apiBaseUrl = "";  // API calls use relative URLs
	socketUrl = "";   // Socket.IO uses relative URL (same origin)
} else {
	// In development, use explicit localhost URLs
	baseUrl = `http://localhost:${serverPort}`;
	apiBaseUrl = baseUrl;
	socketUrl = baseUrl;
}

// Auto-generate CORS origin based on environment
let autoCorsOrigin;
if (process.env.NODE_ENV === "production") {
	// In production/Docker, allow multiple origins for flexibility
	autoCorsOrigin = [
		`http://localhost:${serverPort}`,
		`http://127.0.0.1:${serverPort}`,
		`http://0.0.0.0:${serverPort}`
	].join(",");
} else {
	// In development, use single origin
	autoCorsOrigin = `http://localhost:${serverPort}`;
}

console.log(`🔍 CONFIG DEBUG - NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔍 CONFIG DEBUG - SERVER_PORT: ${serverPort}`);
console.log(`🔍 CONFIG DEBUG - autoCorsOrigin: ${autoCorsOrigin}`);
console.log(`🔍 CONFIG DEBUG - CORS_ORIGIN env: ${process.env.CORS_ORIGIN}`);

const config = {
	server: {
		port: serverPort,
		nodeEnv: parseEnvVar.string(process.env.NODE_ENV, "development"),
		corsOrigin: parseEnvVar.string(process.env.CORS_ORIGIN, autoCorsOrigin),
	},
	database: {
		path: parseEnvVar.string(process.env.DB_PATH, "/app/data/homelab.db"),
	},
	monitoring: {
		interval: parseEnvVar.int(process.env.MONITOR_INTERVAL, 5000),
		cleanupInterval: parseEnvVar.int(process.env.CLEANUP_INTERVAL, 24), // in hours
		defaultTimeout: parseEnvVar.int(process.env.DEFAULT_TIMEOUT, 10000),
		maxHistoryEntries: parseEnvVar.int(
			process.env.MAX_HISTORY_ENTRIES,
			100
		),
		websiteDownThreshold: parseEnvVar.int(
			process.env.WEBSITE_DOWN_THRESHOLD,
			3
		),
		enableCpuTemperature: parseEnvVar.bool(
			process.env.ENABLE_CPU_TEMPERATURE,
			true
		),
		enableDiskIoMonitoring: parseEnvVar.bool(
			process.env.ENABLE_DISK_IO_MONITORING,
			false
		),
		enableProcessMonitoring: parseEnvVar.bool(
			process.env.ENABLE_PROCESS_MONITORING,
			false
		),
	},
	client: {
		port: serverPort, // Use same port as server
		apiBaseUrl: parseEnvVar.string(
			process.env.REACT_APP_API_BASE_URL,
			apiBaseUrl
		),
		socketUrl: parseEnvVar.string(
			process.env.REACT_APP_SOCKET_URL,
			socketUrl
		),
		chartUpdateInterval: parseEnvVar.int(
			process.env.REACT_APP_CHART_UPDATE_INTERVAL,
			5000
		),
		defaultTimeRange: parseEnvVar.int(
			process.env.REACT_APP_DEFAULT_TIME_RANGE,
			60
		), // in minutes
	},
	systemPaths: {
		proc: parseEnvVar.string(process.env.PROC_PATH, "/proc"),
		sys: parseEnvVar.string(process.env.SYS_PATH, "/sys"),
	},
	security: {
		enableHelmet: parseEnvVar.bool(process.env.ENABLE_HELMET, true),
		trustProxy: parseEnvVar.bool(process.env.TRUST_PROXY, false),
	},
	logging: {
		level: parseEnvVar.string(process.env.LOG_LEVEL, "info"),
		enableDebug: parseEnvVar.bool(process.env.ENABLE_DEBUG_LOGGING, false),
	},
	proxy: {
		domain: parseEnvVar.string(process.env.DASHBOARD_DOMAIN, "localhost"),
		enableHttpsRedirect: parseEnvVar.bool(
			process.env.ENABLE_HTTPS_REDIRECT,
			false
		),
	},

	// Logging configuration
	logging: {
		level: logLevel,
		enableVerbose: enableVerboseLogging,
		production: process.env.NODE_ENV === "production"
	},
};

// Validation function to check critical configuration
const validateConfig = () => {
	const errors = [];

	if (config.server.port < 1 || config.server.port > 65535) {
		errors.push(
			`Invalid port: ${config.server.port}. Must be between 1 and 65535.`
		);
	}

	if (config.monitoring.interval < 1000) {
		errors.push(
			`Monitor interval too low: ${config.monitoring.interval}ms. Minimum is 1000ms.`
		);
	}

	if (config.monitoring.cleanupInterval < 1) {
		errors.push(
			`Cleanup interval too low: ${config.monitoring.cleanupInterval}h. Minimum is 1 hour.`
		);
	}

	if (errors.length > 0) {
		console.error("Configuration validation errors:");
		errors.forEach((error) => console.error(`  - ${error}`));
		process.exit(1);
	}
};

// Validate configuration on load
validateConfig();

module.exports = config;
