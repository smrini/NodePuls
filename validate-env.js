#!/usr/bin/env node

// Environment validation script
require("dotenv").config();

const { config } = require("./server/config/config");

console.log("🔍 Validating environment configuration...\n");

// Check critical configuration values
const checks = [
	{
		name: "Server Port",
		value: config.port,
		valid: config.port >= 1024 && config.port <= 65535,
		message: "Port should be between 1024 and 65535",
	},
	{
		name: "React Port",
		value: process.env.REACT_PORT || 3000,
		valid:
			(process.env.REACT_PORT || 3000) >= 1024 &&
			(process.env.REACT_PORT || 3000) <= 65535,
		message: "Port should be between 1024 and 65535",
	},
	{
		name: "System Update Interval",
		value: config.systemUpdateInterval,
		valid: config.systemUpdateInterval >= 1000,
		message: "Should be at least 1000ms (1 second)",
	},
	{
		name: "Website Check Timeout",
		value: config.websiteCheckTimeout,
		valid: config.websiteCheckTimeout >= 1000,
		message: "Should be at least 1000ms (1 second)",
	},
	{
		name: "Max History Length",
		value: config.maxHistoryLength,
		valid: config.maxHistoryLength > 0,
		message: "Should be greater than 0",
	},
	{
		name: "Default Websites",
		value: config.defaultWebsites.length,
		valid: Array.isArray(config.defaultWebsites),
		message: "Should be a valid JSON array",
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
console.log(`Node Environment: ${config.nodeEnv}`);
console.log(`Server Port: ${config.port}`);
console.log(`System Update Interval: ${config.systemUpdateInterval}ms`);
console.log(`Website Check Interval: ${config.websiteCheckInterval}`);
console.log(`Database Path: ${config.dbPath}`);
console.log(`CORS Origin: ${config.security.corsOrigin}`);
console.log(
	`CPU Temperature Monitoring: ${
		config.monitoring.enableCpuTemperature ? "Enabled" : "Disabled"
	}`
);
console.log(`Default Websites: ${config.defaultWebsites.length} configured`);

if (allValid) {
	console.log("\n✅ All configuration checks passed!");
	process.exit(0);
} else {
	console.log(
		"\n❌ Some configuration issues found. Please check your .env file."
	);
	process.exit(1);
}
