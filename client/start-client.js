#!/usr/bin/env node

// Start script for React client with centralized env loading
const { spawn } = require("child_process");
const path = require("path");

// Load environment using our centralized loader
const EnvLoader = require("../env-loader");
new EnvLoader(__dirname);

console.log(
	`🚀 Starting React client on port ${
		process.env.CLIENT_PORT || process.env.PORT || 3000
	}`
);

// Start React development server
const reactScript = spawn("npm", ["start"], {
	stdio: "inherit",
	shell: true,
	cwd: __dirname,
	env: {
		...process.env,
		PORT: process.env.CLIENT_PORT || process.env.PORT || 3000,
	},
});

reactScript.on("close", (code) => {
	console.log(`React client exited with code ${code}`);
	process.exit(code);
});

reactScript.on("error", (error) => {
	console.error("Failed to start React client:", error);
	process.exit(1);
});
