const axios = require("axios");
const net = require("net");
const { URL } = require("url");
const DatabaseService = require("./databaseService");
const { config } = require("../config/config");

class UptimeMonitor {
	constructor() {
		this.db = new DatabaseService();
		this.websites = new Map(); // Keep in-memory cache for quick access
		this.checkTimeout = config.websiteCheckTimeout;
		this.maxHistory = config.maxWebsiteHistory;
	}

	async init() {
		try {
			const websites = await this.db.getAllWebsites();
			this.websites.clear();
			websites.forEach((website) => {
				try {
					website.history = website.history
						? JSON.parse(website.history)
						: [];
				} catch (e) {
					console.error(
						`Error parsing history for ${website.name}:`,
						e
					);
					website.history = [];
				}
				this.websites.set(website.id, website);
			});
			console.log(`📚 Loaded ${websites.length} websites from database`);
		} catch (error) {
			console.error("❌ Error loading websites from database:", error);
		}
	}

	async addWebsite(name, url) {
		const id = Date.now().toString();
		const website = {
			id,
			name,
			url,
			status: "unknown",
			responseTime: null,
			lastCheck: null,
			upSince: null,
			uptime: 100,
			checks: 0,
			successfulChecks: 0,
			history: [],
		};

		try {
			await this.db.addWebsite(website);
			this.websites.set(id, website);
			console.log(`✅ Added website: ${name} (${url})`);
			return website;
		} catch (error) {
			console.error("❌ Error adding website to database:", error);
			throw error;
		}
	}

	async removeWebsite(id) {
		try {
			const removed = await this.db.removeWebsite(id);
			if (!removed) {
				throw new Error("Website not found");
			}
			this.websites.delete(id);
			console.log(`🗑️ Removed website with ID: ${id}`);
			return true;
		} catch (error) {
			console.error("❌ Error removing website:", error);
			throw error;
		}
	}

	async getWebsites() {
		const websites = Array.from(this.websites.values());

		// Load recent history for each website from database
		for (const website of websites) {
			try {
				const history = await this.db.getWebsiteHistory(website.id, 50); // Get last 50 entries
				website.history = history;
			} catch (error) {
				console.error(
					`Error loading history for ${website.name}:`,
					error
				);
				website.history = [];
			}
		}

		return websites;
	}

	// Measure TCP connection time similar to ping
	async measureTcpConnectTime(url) {
		return new Promise((resolve) => {
			try {
				const parsedUrl = new URL(url);
				const port =
					parsedUrl.port ||
					(parsedUrl.protocol === "https:" ? 443 : 80);
				const hostname = parsedUrl.hostname;

				const startTime = process.hrtime.bigint();
				const socket = new net.Socket();

				socket.setTimeout(this.checkTimeout);

				socket.on("connect", () => {
					const endTime = process.hrtime.bigint();
					const connectTime = Math.round(
						Number(endTime - startTime) / 1000000
					);
					socket.destroy();
					resolve(connectTime);
				});

				socket.on("timeout", () => {
					socket.destroy();
					resolve(null);
				});

				socket.on("error", () => {
					socket.destroy();
					resolve(null);
				});

				socket.connect(port, hostname);
			} catch (error) {
				resolve(null);
			}
		});
	}

	async checkWebsite(website) {
		// First measure just TCP connection time (similar to ping)
		const tcpTime = await this.measureTcpConnectTime(website.url);

		const startTime = process.hrtime.bigint();

		try {
			const response = await axios.get(website.url, {
				timeout: this.checkTimeout,
				validateStatus: (status) => status < 500,
				headers: {
					"User-Agent": "Homelab-Dashboard/1.0",
				},
				maxRedirects: 5,
				decompress: true,
			});

			const endTime = process.hrtime.bigint();
			const httpResponseTime = Math.round(
				Number(endTime - startTime) / 1000000
			);
			const isUp = response.status >= 200 && response.status < 400;

			website.status = isUp ? "up" : "down";
			// Use TCP connection time if available (more accurate for uptime monitoring)
			// Fall back to HTTP response time if TCP measurement failed
			website.responseTime =
				tcpTime !== null ? tcpTime : httpResponseTime;
			website.lastCheck = new Date().toISOString();
			website.checks++;

			if (isUp) {
				website.successfulChecks++;
				// Track the first time the site was detected as up
				if (!website.upSince) {
					website.upSince = new Date().toISOString();
				}
			} else {
				// Reset upSince when the site goes down
				website.upSince = null;
			}

			// Calculate uptime percentage
			website.uptime =
				website.checks > 0
					? Math.round(
							(website.successfulChecks / website.checks) * 100
					  )
					: 100;

			// Save to database
			try {
				await this.db.updateWebsite(website);

				// Add to history in database
				const historyEntry = {
					timestamp: website.lastCheck,
					status: website.status,
					responseTime: website.responseTime,
				};
				await this.db.addHistoryEntry(website.id, historyEntry);
			} catch (dbError) {
				console.error(
					`❌ Database error for ${website.name}:`,
					dbError
				);
			}

			// Add to in-memory history (keep last 24 hours)
			website.history.push({
				timestamp: website.lastCheck,
				status: website.status,
				responseTime: website.responseTime,
			});

			// Keep only last configured number of checks (default 24 hours at 1-minute intervals)
			if (website.history.length > this.maxHistory) {
				website.history = website.history.slice(-this.maxHistory);
			}

			console.log(
				`✅ ${website.name}: ${website.status} (${website.responseTime}ms)`
			);
		} catch (error) {
			const endTime = process.hrtime.bigint();
			const httpResponseTime = Math.round(
				Number(endTime - startTime) / 1000000
			);

			website.status = "down";
			// Use TCP time if available, otherwise null for timeout/error cases
			website.responseTime = tcpTime !== null ? tcpTime : null;
			website.lastCheck = new Date().toISOString();
			website.checks++;

			// For timeout errors, we might want to show the timeout duration
			if (
				error.code === "ECONNABORTED" ||
				error.message.includes("timeout")
			) {
				// If we got a TCP time but HTTP failed, show the TCP time
				if (tcpTime !== null) {
					website.responseTime = tcpTime;
				} else {
					website.responseTime = httpResponseTime; // Show how long it took before timeout
				}
			}

			// Calculate uptime percentage
			website.uptime =
				website.checks > 0
					? Math.round(
							(website.successfulChecks / website.checks) * 100
					  )
					: 100;

			// Save to database
			try {
				await this.db.updateWebsite(website);

				// Add to history in database
				const historyEntry = {
					timestamp: website.lastCheck,
					status: "down",
					responseTime: website.responseTime, // Use the actual response time (could be TCP time or null)
				};
				await this.db.addHistoryEntry(website.id, historyEntry);
			} catch (dbError) {
				console.error(
					`❌ Database error for ${website.name}:`,
					dbError
				);
			}

			// Add to in-memory history
			website.history.push({
				timestamp: website.lastCheck,
				status: "down",
				responseTime: website.responseTime, // Use the actual response time (could be TCP time or null)
				error: error.message,
			});

			// Keep only last configured number of checks
			if (website.history.length > this.maxHistory) {
				website.history = website.history.slice(-this.maxHistory);
			}

			console.log(`❌ ${website.name}: down (${error.message})`);
		}

		return website;
	}

	async checkAllWebsites() {
		const checkPromises = Array.from(this.websites.values()).map(
			(website) => this.checkWebsite(website)
		);

		try {
			await Promise.all(checkPromises);
		} catch (error) {
			console.error("Error checking websites:", error);
		}
	}

	getUptimeStats() {
		const websites = Array.from(this.websites.values());
		const totalWebsites = websites.length;
		const upWebsites = websites.filter((w) => w.status === "up").length;
		const averageUptime =
			totalWebsites > 0
				? websites.reduce((sum, w) => sum + w.uptime, 0) / totalWebsites
				: 100;

		return {
			total: totalWebsites,
			up: upWebsites,
			down: totalWebsites - upWebsites,
			averageUptime: Math.round(averageUptime),
		};
	}

	async updateWebsite(id, name, url) {
		try {
			const website = this.websites.get(id);
			if (!website) {
				throw new Error("Website not found");
			}

			// Update the website object
			website.name = name;
			website.url = url;
			website.status = "unknown"; // Reset status since URL changed
			website.responseTime = null;
			website.lastCheck = null;
			// Don't reset uptime stats - keep historical data

			// Save to database
			await this.db.updateWebsite(website);

			console.log(`✅ Updated website: ${name} (${url})`);
			return website;
		} catch (error) {
			console.error("❌ Error updating website:", error);
			throw error;
		}
	}

	async clearWebsiteHistory(id) {
		try {
			const cleared = await this.db.clearWebsiteHistory(id);

			// Also reset the uptime statistics for the website
			const website = this.websites.get(id);
			if (website) {
				website.checks = 0;
				website.successfulChecks = 0;
				website.uptime = 100; // Reset to 100% since we're starting fresh
				website.upSince = null; // Reset upSince

				// Update the website in the database
				await this.db.updateWebsite(website);
			}

			console.log(
				`🗑️ Cleared history and reset uptime stats for website ID: ${id} (${cleared} entries removed)`
			);
			return true;
		} catch (error) {
			console.error("❌ Error clearing website history:", error);
			throw error;
		}
	}
}

module.exports = new UptimeMonitor();
