const path = require("path");
const fs = require("fs");

/**
 * Centralized environment configuration loader
 * Loads .env files in this order of priority:
 * 1. Local .env file (client/.env or server/.env)
 * 2. Root .env file
 * 3. System environment variables
 */
class EnvLoader {
	constructor(contextPath = process.cwd()) {
		this.contextPath = contextPath;
		this.rootPath = this.findRootPath();
		this.loadEnvironment();
	}

	findRootPath() {
		let currentPath = this.contextPath;

		// Look for package.json in parent directories to find root
		while (currentPath !== path.dirname(currentPath)) {
			const packageJsonPath = path.join(currentPath, "package.json");
			if (fs.existsSync(packageJsonPath)) {
				try {
					const packageJson = JSON.parse(
						fs.readFileSync(packageJsonPath, "utf8")
					);
					// Check if this is the root package.json (has homelab-dashboard name)
					if (packageJson.name === "homelab-dashboard") {
						return currentPath;
					}
				} catch (error) {
					// Continue searching
				}
			}
			currentPath = path.dirname(currentPath);
		}

		// Fallback to current directory
		return this.contextPath;
	}

	loadEnvironment() {
		const dotenv = require("dotenv");

		// Load root .env file first (lowest priority)
		const rootEnvPath = path.join(this.rootPath, ".env");
		if (fs.existsSync(rootEnvPath)) {
			dotenv.config({ path: rootEnvPath });
			console.log(`✅ Loaded root environment from: ${rootEnvPath}`);
		}

		// Load local .env file (higher priority)
		const localEnvPath = path.join(this.contextPath, ".env");
		if (fs.existsSync(localEnvPath)) {
			dotenv.config({ path: localEnvPath, override: true });
			console.log(`✅ Loaded local environment from: ${localEnvPath}`);
		}

		// Apply context-specific transformations
		this.applyContextTransforms();

		// System environment variables have highest priority (already loaded)
	}

	applyContextTransforms() {
		// Auto-generate React environment variables from main variables
		if (process.env.PORT) {
			process.env.REACT_APP_SERVER_PORT = process.env.PORT;
			process.env.REACT_APP_API_BASE_URL = `http://localhost:${process.env.PORT}`;
			process.env.REACT_APP_SOCKET_URL = `http://localhost:${process.env.PORT}`;
		}

		// If we're in the client directory, map CLIENT_PORT to PORT for React
		if (this.contextPath.includes("client") && process.env.CLIENT_PORT) {
			process.env.PORT = process.env.CLIENT_PORT;
			console.log(
				`🔄 Mapped CLIENT_PORT (${process.env.CLIENT_PORT}) to PORT for React client`
			);
		}
	}

	getConfig() {
		return {
			rootPath: this.rootPath,
			contextPath: this.contextPath,
			env: process.env,
		};
	}
}

module.exports = EnvLoader;
