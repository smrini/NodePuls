#!/usr/bin/env node

// Environment validation script
const EnvLoader = require("./env-loader");
new EnvLoader(__dirname);

const config = require("./config");

console.log("🔍 Validating environment configuration...\n");

// Check critical configuration values
const checks = [
	{
		name: "Server Port",
		value: config.server.port,
		valid: config.server.port >= 1024 && config.server.port <= 65535,
		message: "Port should be between 1024 and 65535",
	},
	{
		name: "Client Port",
		value: config.client.port,
		valid: config.client.port >= 1024 && config.client.port <= 65535,
		message: "Port should be between 1024 and 65535",
	},
	{
		name: "Monitor Interval",
		value: config.monitoring.interval,
		valid: config.monitoring.interval >= 1000,
		message: "Should be at least 1000ms (1 second)",
	},
	{
		name: "Default Timeout",
		value: config.monitoring.defaultTimeout,
		valid: config.monitoring.defaultTimeout >= 1000,
		message: "Should be at least 1000ms (1 second)",
	},
	{
		name: "Max History Entries",
		value: config.monitoring.maxHistoryEntries,
		valid: config.monitoring.maxHistoryEntries > 0,
		message: "Should be greater than 0",
	},
	{
		name: "Database Path",
		value: config.database.path,
		valid:
			typeof config.database.path === "string" &&
			config.database.path.length > 0,
		message: "Should be a valid path",
	},
];

let allValid = true;

checks.forEach((check) => {
	const status = check.valid ? "✅" : "❌";
	console.log(`${status} ${check.name}: ${check.value}`);

	if (!check.valid) {
		console.log(`   ⚠️  ${check.message}`);
		allValid = false;
	}
});

console.log("\n📊 Configuration Summary:");
console.log("─".repeat(50));
console.log(`Node Environment: ${config.server.nodeEnv}`);
console.log(`Server Port: ${config.server.port}`);
console.log(`Client Port: ${config.client.port}`);
console.log(`Monitor Interval: ${config.monitoring.interval}ms`);
console.log(`Database Path: ${config.database.path}`);
console.log(`CORS Origin: ${config.server.corsOrigin}`);
console.log(
	`CPU Temperature Monitoring: ${
		config.monitoring.enableCpuTemperature ? "Enabled" : "Disabled"
	}`
);
console.log(`API Base URL: ${config.client.apiBaseUrl}`);
console.log(`Socket URL: ${config.client.socketUrl}`);

if (allValid) {
	console.log("\n✅ All configuration checks passed!");
	process.exit(0);
} else {
	console.log(
		"\n❌ Some configuration issues found. Please check your .env file."
	);
	process.exit(1);
}
