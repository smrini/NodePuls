// Load environment variables
require("dotenv").config();

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

// Get server port for dynamic URL generation
const serverPort = parseEnvVar.int(process.env.PORT, 3050);
const baseUrl = `http://localhost:${serverPort}`;

const config = {
	server: {
		port: serverPort,
		nodeEnv: parseEnvVar.string(process.env.NODE_ENV, "production"),
		corsOrigin: parseEnvVar.string(process.env.CORS_ORIGIN, "*"),
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
		port: parseEnvVar.int(process.env.CLIENT_PORT, 5000),
		apiBaseUrl: parseEnvVar.string(
			process.env.REACT_APP_API_BASE_URL,
			baseUrl
		),
		socketUrl: parseEnvVar.string(
			process.env.REACT_APP_SOCKET_URL,
			baseUrl
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
