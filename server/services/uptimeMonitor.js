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
		this.idCounter = 0; // Counter to prevent ID collisions during rapid imports
	}

	async init() {
		try {
			// Wait for database to be fully initialized
			await this.db.waitForInit();

			const websites = await this.db.getAllWebsites();
			this.websites.clear();
			websites.forEach((website) => {
				try {
					// Handle empty or null history gracefully
					if (website.history && typeof website.history === 'string' && website.history.trim() !== '') {
						website.history = JSON.parse(website.history);
					} else {
						website.history = [];
					}
				} catch (e) {
					console.error(
						`Error parsing history for ${website.name}:`,
						e.message
					);
					console.log(`Raw history data: "${website.history}"`);
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
		// Generate unique ID with timestamp, counter, and random component to prevent collisions
		const timestamp = Date.now();
		const counter = ++this.idCounter;
		const random = Math.floor(Math.random() * 1000);
		const id = `${timestamp}_${counter}_${random}`;
		
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
		try {
			// Get websites from database in sort_order
			const orderedWebsites = await this.db.getAllWebsites();
			
			// Merge with in-memory data and load recent history
			const websites = [];
			for (const dbWebsite of orderedWebsites) {
				const memoryWebsite = this.websites.get(dbWebsite.id);
				if (memoryWebsite) {
					// Use memory website with current status, but preserve DB order
					const website = { ...memoryWebsite };
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
					websites.push(website);
				}
			}

			return websites;
		} catch (error) {
			console.error("Error getting websites from database:", error);
			// Fallback to in-memory websites if database fails
			const websites = Array.from(this.websites.values());
			for (const website of websites) {
				try {
					const history = await this.db.getWebsiteHistory(website.id, 50);
					website.history = history;
				} catch (historyError) {
					console.error(
						`Error loading history for ${website.name}:`,
						historyError
					);
					website.history = [];
				}
			}
			return websites;
		}
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

	// Perform a single HTTP check attempt
	async performSingleCheck(website, method = 'GET', attempt = 1) {
		const startTime = process.hrtime.bigint();
		
		try {
			const axiosConfig = {
				timeout: this.checkTimeout || 10000,
				validateStatus: (status) => status < 500,
				headers: {
					"User-Agent": "Mozilla/5.0 (compatible; NodePuls/1.0; +monitoring-bot)",
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
					"Accept-Language": "en-US,en;q=0.5",
					"Accept-Encoding": "gzip, deflate",
					"Connection": "keep-alive",
					"Cache-Control": "no-cache",
				},
				maxRedirects: 10,
				decompress: true,
				httpsAgent: new (require('https').Agent)({
					rejectUnauthorized: false,
					timeout: 10000
				}),
				httpAgent: new (require('http').Agent)({
					timeout: 10000,
					keepAlive: true
				})
			};

			const response = method === 'HEAD' 
				? await axios.head(website.url, axiosConfig)
				: await axios.get(website.url, axiosConfig);

			const endTime = process.hrtime.bigint();
			const responseTime = Math.round(Number(endTime - startTime) / 1000000);
			
			const isUp = response.status >= 200 && response.status < 500;
			
			return {
				success: isUp,
				responseTime,
				status: response.status,
				method,
				attempt,
				error: null
			};
		} catch (error) {
			const endTime = process.hrtime.bigint();
			const responseTime = Math.round(Number(endTime - startTime) / 1000000);
			
			return {
				success: false,
				responseTime,
				status: null,
				method,
				attempt,
				error: error.message
			};
		}
	}

	initializeWebsiteHealth(website) {
		if (!website.healthScore) {
			website.healthScore = 100; // Start with perfect health
		}
		if (!website.consecutiveFailures) {
			website.consecutiveFailures = 0;
		}
		if (!website.lastSuccessfulCheck) {
			website.lastSuccessfulCheck = null;
		}
	}

	updateWebsiteHealth(website, checkResult) {
		this.initializeWebsiteHealth(website);
		
		if (checkResult.success) {
			// Successful check - improve health score
			website.healthScore = Math.min(100, website.healthScore + 10);
			website.consecutiveFailures = 0;
			website.lastSuccessfulCheck = website.lastCheck;
		} else {
			// Failed check - reduce health score
			website.consecutiveFailures++;
			website.healthScore = Math.max(0, website.healthScore - 15);
		}
		
		// Determine status based on health score and consecutive failures
		// More resilient: only mark as down after multiple failures or very low health
		const shouldBeDown = (
			website.healthScore <= 30 && website.consecutiveFailures >= 2
		) || website.consecutiveFailures >= 3;
		
		// Override the binary status with health-based status
		if (!shouldBeDown && website.healthScore > 30) {
			website.status = "up";
		} else {
			website.status = "down";
		}
		
		console.log(`🏥 ${website.name} health: ${website.healthScore}% (failures: ${website.consecutiveFailures})`);
	}

	async checkWebsite(website) {
		// First measure TCP connection time (similar to ping)
		const tcpTime = await this.measureTcpConnectTime(website.url);
		
		const checkResults = [];
		let finalResult = null;
		
		// Strategy 1: Try HEAD request first (lighter)
		console.log(`🔍 Checking ${website.name} - Attempt 1 (HEAD)`);
		const headResult = await this.performSingleCheck(website, 'HEAD', 1);
		checkResults.push(headResult);
		
		if (headResult.success) {
			finalResult = headResult;
		} else {
			// Strategy 2: Try GET request
			console.log(`🔍 Checking ${website.name} - Attempt 2 (GET)`);
			const getResult = await this.performSingleCheck(website, 'GET', 2);
			checkResults.push(getResult);
			
			if (getResult.success) {
				finalResult = getResult;
			} else {
				// Strategy 3: One more GET attempt with shorter timeout for quick fail
				console.log(`🔍 Checking ${website.name} - Attempt 3 (GET, shorter timeout)`);
				const quickResult = await this.performSingleCheck(website, 'GET', 3);
				checkResults.push(quickResult);
				
				// Use the best result from all attempts
				finalResult = checkResults.find(r => r.success) || quickResult;
			}
		}
		
		// Update website status based on final result and health scoring
		const initialStatus = finalResult.success ? "up" : "down";
		this.updateWebsiteHealth(website, finalResult);
		
		// Use health-based status instead of single-check result
		// website.status is set by updateWebsiteHealth()
		
		// Use TCP time if available and reasonable, otherwise use HTTP response time
		website.responseTime = (tcpTime !== null && tcpTime > 0 && tcpTime < finalResult.responseTime) 
			? tcpTime 
			: finalResult.responseTime;
			
		website.lastCheck = new Date().toISOString();
		website.checks++;

		const isUp = website.status === "up"; // Use health-based status
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

		// Log result with attempt details
		const attemptInfo = checkResults.length > 1 
			? ` (tried ${checkResults.length} methods)`
			: '';
		
		if (isUp) {
			console.log(`✅ ${website.name}: ${website.status} (${website.responseTime}ms)${attemptInfo}`);
		} else {
			const errorSummary = checkResults.map(r => `${r.method}:${r.error || 'unknown'}`).join(', ');
			console.log(`❌ ${website.name}: ${website.status} - ${errorSummary}${attemptInfo}`);
		}

		// Update health score and status
		this.updateWebsiteHealth(website, finalResult);

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
