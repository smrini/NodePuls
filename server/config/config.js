const config = {
	// System monitoring interval in milliseconds
	systemUpdateInterval: process.env.SYSTEM_UPDATE_INTERVAL || 5000, // 5 seconds

	// Website check interval (handled by cron job - every minute)
	websiteCheckInterval: process.env.WEBSITE_CHECK_INTERVAL || "*/1 * * * *", // Every minute

	// Website check timeout
	websiteCheckTimeout: parseInt(process.env.WEBSITE_CHECK_TIMEOUT) || 5000, // 5 seconds

	// Maximum history length for charts
	maxHistoryLength: parseInt(process.env.MAX_HISTORY_LENGTH) || 60, // 60 data points

	// Maximum website history entries
	maxWebsiteHistory: parseInt(process.env.MAX_WEBSITE_HISTORY) || 1440, // 24 hours at 1-minute intervals

	// Server settings
	port: process.env.PORT || 3001,
	nodeEnv: process.env.NODE_ENV || "development",

	// Database settings
	dbPath: process.env.DB_PATH || "/app/data/homelab.db",

	// System paths
	procPath: process.env.PROC_PATH || "/proc",
	sysPath: process.env.SYS_PATH || "/sys",

	// Default websites to monitor (can be configured via environment)
	defaultWebsites: process.env.DEFAULT_WEBSITES
		? JSON.parse(process.env.DEFAULT_WEBSITES)
		: [
				// Examples - remove or customize as needed
				// { name: 'Google', url: 'https://google.com' },
				// { name: 'GitHub', url: 'https://github.com' }
		  ],

	// Performance settings
	performance: {
		compressionLevel: parseInt(process.env.COMPRESSION_LEVEL) || 6,
		requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000, // 10 seconds
		maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 100,
	},

	// Security settings
	security: {
		corsOrigin:
			process.env.CORS_ORIGIN ||
			(process.env.NODE_ENV === "production"
				? false
				: "http://localhost:3000"),
		enableHelmet: process.env.ENABLE_HELMET !== "false", // Default true
		trustProxy: process.env.TRUST_PROXY === "true", // Default false
	},

	// Monitoring settings
	monitoring: {
		websiteDownThreshold: parseInt(process.env.WEBSITE_DOWN_THRESHOLD) || 3,
		enableEmailNotifications:
			process.env.ENABLE_EMAIL_NOTIFICATIONS === "true",
		enableCpuTemperature: process.env.ENABLE_CPU_TEMPERATURE !== "false", // Default true
		enableDiskIoMonitoring:
			process.env.ENABLE_DISK_IO_MONITORING === "true",
		enableProcessMonitoring:
			process.env.ENABLE_PROCESS_MONITORING === "true",
	},

	// Logging settings
	logging: {
		level: process.env.LOG_LEVEL || "info",
		enableDebug: process.env.ENABLE_DEBUG_LOGGING === "true",
	},

	// Reverse proxy settings
	proxy: {
		domain: process.env.DASHBOARD_DOMAIN || "localhost",
		enableHttpsRedirect: process.env.ENABLE_HTTPS_REDIRECT === "true",
	},
};

module.exports = { config };
