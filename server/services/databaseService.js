const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class DatabaseService {
	constructor() {
		this.dbPath = path.join(__dirname, "..", "data", "homelab.db");
		this.db = null;
		this.initialized = false;
		this._initPromise = this.init();
	}

	async init() {
		return new Promise((resolve, reject) => {
			// Create data directory if it doesn't exist
			const fs = require("fs");
			const dataDir = path.dirname(this.dbPath);
			if (!fs.existsSync(dataDir)) {
				fs.mkdirSync(dataDir, { recursive: true });
			}

			// Initialize database
			this.db = new sqlite3.Database(this.dbPath, async (err) => {
				if (err) {
					console.error("❌ Error opening database:", err.message);
					reject(err);
				} else {
					console.log("✅ Connected to SQLite database");
					try {
						await this.createTables();
						this.initialized = true;
						resolve();
					} catch (error) {
						reject(error);
					}
				}
			});
		});
	}

	async waitForInit() {
		if (!this.initialized) {
			await this._initPromise;
		}
	}

	createTables() {
		return new Promise((resolve, reject) => {
			const createWebsitesTable = `
            CREATE TABLE IF NOT EXISTS websites (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                status TEXT DEFAULT 'unknown',
                response_time INTEGER,
                last_check TEXT,
                up_since TEXT,
                uptime REAL DEFAULT 100,
                checks INTEGER DEFAULT 0,
                successful_checks INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `;

			const createHistoryTable = `
            CREATE TABLE IF NOT EXISTS website_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                website_id TEXT,
                timestamp TEXT,
                status TEXT,
                response_time INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (website_id) REFERENCES websites (id) ON DELETE CASCADE
            )
        `;

			let tablesCreated = 0;
			const totalTables = 2;
			let migrationsCompleted = 0;
			const totalMigrations = 5; // up_since, health_score, consecutive_failures, last_successful_check, sort_order

			const checkAllComplete = () => {
				if (tablesCreated === totalTables && migrationsCompleted === totalMigrations) {
					resolve();
				}
			};

			this.db.run(createWebsitesTable, (err) => {
				if (err) {
					console.error(
						"❌ Error creating websites table:",
						err.message
					);
					reject(err);
				} else {
					console.log("✅ Websites table ready");
					
					// Run migrations after table is created
					// Add up_since column if it doesn't exist (migration)
					this.db.run(
						"ALTER TABLE websites ADD COLUMN up_since TEXT",
						(err) => {
							if (
								err &&
								!err.message.includes("duplicate column")
							) {
								console.error(
									"❌ Error adding up_since column:",
									err.message
								);
							} else if (!err) {
								console.log(
									"✅ Added up_since column to websites table"
								);
							}
							migrationsCompleted++;
							checkAllComplete();
						}
					);
					
					// Add health tracking columns (migration)
					this.db.run(
						"ALTER TABLE websites ADD COLUMN health_score INTEGER DEFAULT 100",
						(err) => {
							if (
								err &&
								!err.message.includes("duplicate column")
							) {
								console.error(
									"❌ Error adding health_score column:",
									err.message
								);
							}
							migrationsCompleted++;
							checkAllComplete();
						}
					);
					
					this.db.run(
						"ALTER TABLE websites ADD COLUMN consecutive_failures INTEGER DEFAULT 0",
						(err) => {
							if (
								err &&
								!err.message.includes("duplicate column")
							) {
								console.error(
									"❌ Error adding consecutive_failures column:",
									err.message
								);
							}
							migrationsCompleted++;
							checkAllComplete();
						}
					);
					
					this.db.run(
						"ALTER TABLE websites ADD COLUMN last_successful_check TEXT",
						(err) => {
							if (
								err &&
								!err.message.includes("duplicate column")
							) {
								console.error(
									"❌ Error adding last_successful_check column:",
									err.message
								);
							}
							migrationsCompleted++;
							checkAllComplete();
						}
					);
					
					// Add sort_order column for drag and drop ordering (migration)
					this.db.run(
						"ALTER TABLE websites ADD COLUMN sort_order INTEGER DEFAULT 0",
						(err) => {
							if (
								err &&
								!err.message.includes("duplicate column")
							) {
								console.error(
									"❌ Error adding sort_order column:",
									err.message
								);
							} else if (!err) {
								console.log(
									"✅ Added sort_order column to websites table"
								);
							}
							migrationsCompleted++;
							checkAllComplete();
						}
					);
					
					tablesCreated++;
					checkAllComplete();
				}
			});

			this.db.run(createHistoryTable, (err) => {
				if (err) {
					console.error(
						"❌ Error creating history table:",
						err.message
					);
					reject(err);
				} else {
					console.log("✅ Website history table ready");
					tablesCreated++;
					checkAllComplete();
				}
			});
		});
	}

	// Website operations
	addWebsite(website) {
		return new Promise((resolve, reject) => {
			// First, get the highest sort_order to append the new website at the end
			this.db.get(
				"SELECT MAX(sort_order) as max_order FROM websites",
				(err, row) => {
					if (err) {
						reject(err);
						return;
					}

					const nextSortOrder = (row.max_order || 0) + 1;

					const query = `
                        INSERT INTO websites (id, name, url, status, response_time, last_check, up_since, uptime, checks, successful_checks, sort_order)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

					this.db.run(
						query,
						[
							website.id,
							website.name,
							website.url,
							website.status,
							website.responseTime,
							website.lastCheck,
							website.upSince,
							website.uptime,
							website.checks,
							website.successfulChecks,
							nextSortOrder,
						],
						function (err) {
							if (err) {
								reject(err);
							} else {
								resolve({...website, sort_order: nextSortOrder});
							}
						}
					);
				}
			);
		});
	}

	updateWebsite(website) {
		return new Promise((resolve, reject) => {
			const query = `
                UPDATE websites 
                SET name = ?, url = ?, status = ?, response_time = ?, last_check = ?, up_since = ?,
                    uptime = ?, checks = ?, successful_checks = ?, health_score = ?, 
                    consecutive_failures = ?, last_successful_check = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

			this.db.run(
				query,
				[
					website.name,
					website.url,
					website.status,
					website.responseTime,
					website.lastCheck,
					website.upSince,
					website.uptime,
					website.checks,
					website.successfulChecks,
					website.healthScore || 100,
					website.consecutiveFailures || 0,
					website.lastSuccessfulCheck,
					website.id,
				],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve(website);
					}
				}
			);
		});
	}

	removeWebsite(id) {
		return new Promise((resolve, reject) => {
			this.db.run(
				"DELETE FROM websites WHERE id = ?",
				[id],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve(this.changes > 0);
					}
				}
			);
		});
	}

	async getAllWebsites() {
		await this.waitForInit();
		return new Promise((resolve, reject) => {
			this.db.all(
				"SELECT * FROM websites ORDER BY sort_order ASC, created_at DESC",
				[],
				(err, rows) => {
					if (err) {
						reject(err);
					} else {
						const websites = rows.map((row) => ({
							id: row.id,
							name: row.name,
							url: row.url,
							status: row.status,
							responseTime: row.response_time,
							lastCheck: row.last_check,
							upSince: row.up_since,
							uptime: row.uptime,
							checks: row.checks,
							successfulChecks: row.successful_checks,
							healthScore: row.health_score || 100,
							consecutiveFailures: row.consecutive_failures || 0,
							lastSuccessfulCheck: row.last_successful_check,
							sortOrder: row.sort_order || 0,
							history: [], // Will be loaded separately if needed
						}));
						resolve(websites);
					}
				}
			);
		});
	}

	getWebsiteById(id) {
		return new Promise((resolve, reject) => {
			this.db.get(
				"SELECT * FROM websites WHERE id = ?",
				[id],
				(err, row) => {
					if (err) {
						reject(err);
					} else if (!row) {
						resolve(null);
					} else {
						const website = {
							id: row.id,
							name: row.name,
							url: row.url,
							status: row.status,
							responseTime: row.response_time,
							lastCheck: row.last_check,
							upSince: row.up_since,
							uptime: row.uptime,
							checks: row.checks,
							successfulChecks: row.successful_checks,
							healthScore: row.health_score || 100,
							consecutiveFailures: row.consecutive_failures || 0,
							lastSuccessfulCheck: row.last_successful_check,
							sortOrder: row.sort_order || 0,
							history: [],
						};
						resolve(website);
					}
				}
			);
		});
	}

	// History operations
	addHistoryEntry(websiteId, entry) {
		return new Promise((resolve, reject) => {
			const query = `
                INSERT INTO website_history (website_id, timestamp, status, response_time)
                VALUES (?, ?, ?, ?)
            `;

			this.db.run(
				query,
				[websiteId, entry.timestamp, entry.status, entry.responseTime],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve(entry);
					}
				}
			);
		});
	}

	getWebsiteHistory(websiteId, limit = 1440) {
		return new Promise((resolve, reject) => {
			const query = `
                SELECT * FROM website_history 
                WHERE website_id = ? 
                ORDER BY created_at ASC 
                LIMIT ?
            `;

			this.db.all(query, [websiteId, limit], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					const history = rows.map((row) => ({
						timestamp: row.timestamp,
						status: row.status,
						responseTime: row.response_time,
					}));
					resolve(history);
				}
			});
		});
	}

	clearWebsiteHistory(websiteId) {
		return new Promise((resolve, reject) => {
			const query = `DELETE FROM website_history WHERE website_id = ?`;

			this.db.run(query, [websiteId], function (err) {
				if (err) {
					reject(err);
				} else {
					resolve(this.changes);
				}
			});
		});
	}

	updateWebsiteOrder(websiteIds) {
		return new Promise((resolve, reject) => {
			// Store reference to the database instance
			const db = this.db;
			
			// Simple retry mechanism for transaction conflicts
			const executeUpdate = (retryCount = 0) => {
				// Use a transaction to update all sort orders atomically
				db.serialize(() => {
					db.run("BEGIN TRANSACTION", (err) => {
						if (err) {
							// If transaction error and we can retry, wait and try again
							if (err.message.includes("cannot start a transaction") && retryCount < 3) {
								setTimeout(() => executeUpdate(retryCount + 1), 50 * (retryCount + 1));
								return;
							}
							reject(err);
							return;
						}

						let completed = 0;
						let hasError = false;
						const total = websiteIds.length;

						if (total === 0) {
							db.run("COMMIT", () => resolve([]));
							return;
						}

						// Update each website's sort_order based on its position in the array
						websiteIds.forEach((websiteId, index) => {
							const query = `UPDATE websites SET sort_order = ? WHERE id = ?`;
							
							db.run(query, [index, websiteId], function (err) {
								if (err && !hasError) {
									hasError = true;
									console.error("❌ Error updating website order:", err.message);
									db.run("ROLLBACK", () => reject(err));
									return;
								}

								completed++;
								if (completed === total && !hasError) {
									db.run("COMMIT", (commitErr) => {
										if (commitErr) {
											reject(commitErr);
										} else {
											console.log(`✅ Updated sort order for ${total} websites`);
											resolve(websiteIds);
										}
									});
								}
							});
						});
					});
				});
			};

			executeUpdate();
		});
	}

	close() {
		if (this.db) {
			this.db.close((err) => {
				if (err) {
					console.error("❌ Error closing database:", err.message);
				} else {
					console.log("✅ Database connection closed");
				}
			});
		}
	}
}

module.exports = DatabaseService;
