const si = require("systeminformation");
const path = require("path");
const fs = require("fs");

class SystemMonitor {
	constructor() {
		this.history = {
			cpu: [],
			memory: [],
			disk: [],
			network: [],
			temperature: [],
		};
		this.maxHistoryLength = 60; // Keep 60 data points (1 hour at 1-minute intervals)
		this.isDockerEnvironment = this.detectDockerEnvironment();
		
		// Configure systeminformation for Docker if needed
		if (this.isDockerEnvironment) {
			console.log("🐳 Docker environment detected, configuring system monitoring...");
			this.configureForDocker();
		}
	}

	detectDockerEnvironment() {
		// Check if running in Docker
		try {
			return fs.existsSync('/.dockerenv') || 
				   fs.existsSync('/proc/1/cgroup') && 
				   fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker');
		} catch (error) {
			return false;
		}
	}

	configureForDocker() {
		// The si.set() method is not available in all versions
		// Instead, we'll handle host path access differently
		try {
			// Check for mounted host paths
			const hostProcPath = '/host/proc';
			const hostSysPath = '/host/sys';
			const procPath = '/proc';
			const sysPath = '/sys';
			
			let configuredPaths = false;
			
			// Try host-mounted paths first (preferred for Docker)
			if (fs.existsSync(hostProcPath) && fs.existsSync(hostSysPath)) {
				console.log("✅ Host-mounted /proc and /sys detected at /host/*");
				this.hostProcPath = hostProcPath;
				this.hostSysPath = hostSysPath;
				configuredPaths = true;
			} 
			// Fallback to direct mounted paths (host networking)
			else if (fs.existsSync(procPath) && fs.existsSync(sysPath)) {
				console.log("✅ Direct-mounted /proc and /sys detected (host networking)");
				this.hostProcPath = procPath;
				this.hostSysPath = sysPath;
				configuredPaths = true;
			}
			
			if (configuredPaths) {
				console.log("🔧 Docker environment configured for host monitoring");
			} else {
				console.log("⚠️ Host system paths not found, using container data");
			}
		} catch (error) {
			console.error("❌ Error configuring Docker environment:", error);
		}
	}

	async getSystemInfo() {
		try {
			// Add debug logging for Docker environments
			if (this.isDockerEnvironment) {
				console.log("🔍 Fetching system info in Docker environment...");
			}

			const [cpu, memory, disk, network, osInfo, time, cpuInfo, temp] =
				await Promise.all([
					si.currentLoad(),
					si.mem(),
					si.fsSize(),
					si.networkStats(),
					si.osInfo(),
					si.time(),
					si.cpu(),
					si.cpuTemperature(),
				]);

			// Try to get host memory data in Docker
			let memoryData = memory;
			if (this.isDockerEnvironment) {
				const hostMemory = await this.getHostMemoryInfo();
				if (hostMemory) {
					memoryData = hostMemory;
				}
			}

			// Try to get host network data in Docker
			let networkInterfaces = network;
			if (this.isDockerEnvironment) {
				const hostNetwork = await this.getHostNetworkInfo();
				if (hostNetwork && hostNetwork.length > 0) {
					networkInterfaces = hostNetwork;
				}
			}

			// Debug: Log raw data in Docker environment
			if (this.isDockerEnvironment) {
				console.log("📊 Raw system data:");
				console.log(`  CPU Load: ${cpu.currentLoad}%`);
				console.log(`  Memory: ${this.formatBytes(memoryData.used)}/${this.formatBytes(memoryData.total)}`);
				console.log(`  Disk info: ${disk ? disk.length : 0} filesystems detected`);
				if (disk && disk.length > 0) {
					console.log(`  Raw disk data:`, disk.map(d => ({ mount: d.mount, fs: d.fs, size: this.formatBytes(d.size || 0) })));
				}
				console.log(`  Network interfaces: ${networkInterfaces.length}`);
				if (networkInterfaces.length > 0) {
					const firstIface = networkInterfaces[0];
					console.log(`  Network RX: ${firstIface.rx_sec || 0} bytes/sec`);
					console.log(`  Network TX: ${firstIface.tx_sec || 0} bytes/sec`);
				}
			}

			// Get primary disk using original automatic detection
			let primaryDisk = this.getPrimaryDisk(disk);

			// Handle network data more robustly
			const networkData = this.getNetworkData(networkInterfaces);

			const systemData = {
				timestamp: Date.now(),
				cpu: {
					usage: cpu.currentLoad || 0,
					load: cpu.avgLoad || [0, 0, 0],
					cores: cpu.cpus?.length || cpuInfo.cores || 0,
					speed: cpuInfo.speed || 2.0, // Keep as GHz
					temperature: this.extractTemperature(temp), // Use helper method to get temperature
				},
				memory: {
					total: memoryData.total || 0,
					used: memoryData.used || 0,
					free: memoryData.free || memoryData.available || 0,
					percentage: memoryData.percentage || (
						memoryData.total > 0
							? (memoryData.used / memoryData.total) * 100
							: 0
					),
				},
				disk: {
					total: primaryDisk.size || 0,
					used: primaryDisk.used || 0,
					free: primaryDisk.available || primaryDisk.free || 0,
					percentage: primaryDisk.use || 0,
				},
				network: networkData,
				uptime: time.uptime || 0,
			};

			// Add to history
			this.addToHistory(systemData);

			return systemData;
		} catch (error) {
			console.error("❌ Error getting system info:", error);
			
			// Return fallback data instead of throwing
			return this.getFallbackSystemData();
		}
	}

	addToHistory(data) {
		const timestamp = data.timestamp;

		// Add CPU data
		this.history.cpu.push({
			timestamp,
			usage: data.cpu.usage,
			temperature: data.cpu.temperature,
		});

		// Add Memory data
		this.history.memory.push({
			timestamp,
			usage: data.memory.percentage,
		});

		// Add Disk data
		this.history.disk.push({
			timestamp,
			usage: data.disk.percentage,
		});

		// Add Network data
		this.history.network.push({
			timestamp,
			rx_sec: data.network.rx_sec,
			tx_sec: data.network.tx_sec,
		});

		// Trim history to max length
		Object.keys(this.history).forEach((key) => {
			if (this.history[key].length > this.maxHistoryLength) {
				this.history[key] = this.history[key].slice(
					-this.maxHistoryLength
				);
			}
		});
	}

	formatBytes(bytes) {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB", "TB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	}

	extractTemperature(tempData) {
		// Try to get the main temperature
		if (
			tempData &&
			typeof tempData.main === "number" &&
			tempData.main > 0
		) {
			return tempData.main;
		}

		// If no main temp, try to get the first core temperature
		if (
			tempData &&
			tempData.cores &&
			Array.isArray(tempData.cores) &&
			tempData.cores.length > 0
		) {
			// Find the first non-zero temperature
			for (const coreTemp of tempData.cores) {
				if (typeof coreTemp === "number" && coreTemp > 0) {
					return coreTemp;
				}
			}
		}

		// If we have max temperature, use that
		if (tempData && typeof tempData.max === "number" && tempData.max > 0) {
			return tempData.max;
		}

		// No valid temperature found, return default
		return 0;
	}

	getPrimaryDisk(disks) {
		// Get primary disk (Windows uses C:, Linux uses /)
		const primaryDisk = disks.find(
			(d) =>
				d.mount === "/" ||
				d.mount === "C:" ||
				d.mount.includes("C:") ||
				d.fs === "C:"
		) ||
			disks[0] || {
				size: 0,
				used: 0,
				available: 0,
				use: 0,
			};

		return primaryDisk;
	}

	getNetworkData(networkInterfaces) {
		if (!networkInterfaces || networkInterfaces.length === 0) {
			return { rx_sec: 0, tx_sec: 0 };
		}

		// Handle null values and find active interfaces
		let totalRx = 0;
		let totalTx = 0;
		let activeInterface = null;
		let validInterfaceCount = 0;

		for (const iface of networkInterfaces) {
			// Handle null values
			const rxSec = iface.rx_sec || 0;
			const txSec = iface.tx_sec || 0;
			
			// Skip loopback and virtual interfaces when possible
			if (iface.iface && 
				!iface.iface.includes('lo') && 
				!iface.iface.includes('docker') && 
				!iface.iface.includes('veth') &&
				!iface.iface.includes('br-')) {
				
				validInterfaceCount++;
				
				// Look for interface with actual traffic
				if (rxSec > 0 || txSec > 0) {
					activeInterface = iface;
					console.log(`🌐 Active interface found: ${iface.iface} (↓${this.formatBytes(rxSec)}/s ↑${this.formatBytes(txSec)}/s)`);
					break;
				}
			}
			
			// Aggregate all interface traffic (including nulls as 0)
			totalRx += rxSec;
			totalTx += txSec;
		}

		// Use active interface if found
		if (activeInterface) {
			return {
				rx_sec: activeInterface.rx_sec || 0,
				tx_sec: activeInterface.tx_sec || 0
			};
		}

		// If no active traffic found, use first valid interface or aggregated data
		const firstValidInterface = networkInterfaces.find(iface => 
			iface.iface && 
			!iface.iface.includes('lo') &&
			!iface.iface.includes('docker') &&
			!iface.iface.includes('veth')
		);

		if (firstValidInterface) {
			console.log(`📡 Using interface: ${firstValidInterface.iface} (no active traffic detected)`);
			return {
				rx_sec: firstValidInterface.rx_sec || 0,
				tx_sec: firstValidInterface.tx_sec || 0
			};
		}

		// Final fallback to first interface or aggregated data
		const firstInterface = networkInterfaces[0];
		return {
			rx_sec: firstInterface?.rx_sec || totalRx || 0,
			tx_sec: firstInterface?.tx_sec || totalTx || 0
		};
	}

	getFallbackSystemData() {
		return {
			timestamp: Date.now(),
			cpu: {
				usage: 0,
				load: [0, 0, 0],
				cores: 0,
				speed: 0,
				temperature: 0,
			},
			memory: {
				total: 0,
				used: 0,
				free: 0,
				percentage: 0,
			},
			disk: {
				total: 0,
				used: 0,
				free: 0,
				percentage: 0,
			},
			network: {
				rx_sec: 0,
				tx_sec: 0,
			},
			uptime: 0,
		};
	}

	// Manual host system data reading methods for Docker environments
	async getHostMemoryInfo() {
		if (!this.isDockerEnvironment || !this.hostProcPath) {
			return null;
		}

		try {
			const memInfoPath = path.join(this.hostProcPath, 'meminfo');
			if (!fs.existsSync(memInfoPath)) {
				return null;
			}

			const memInfo = fs.readFileSync(memInfoPath, 'utf8');
			const lines = memInfo.split('\n');
			
			const memData = {};
			lines.forEach(line => {
				const match = line.match(/^(\w+):\s*(\d+)\s*kB/);
				if (match) {
					memData[match[1]] = parseInt(match[2]) * 1024; // Convert KB to bytes
				}
			});

			if (memData.MemTotal && memData.MemAvailable !== undefined) {
				const total = memData.MemTotal;
				const available = memData.MemAvailable || memData.MemFree || 0;
				const used = total - available;
				
				console.log(`🧠 Host memory: ${this.formatBytes(used)}/${this.formatBytes(total)} (${((used/total)*100).toFixed(1)}%)`);
				
				return {
					total,
					used,
					free: available,
					percentage: (used / total) * 100
				};
			}
		} catch (error) {
			console.error("❌ Error reading host memory info:", error);
		}
		
		return null;
	}

	async getHostNetworkInfo() {
		if (!this.isDockerEnvironment || !this.hostProcPath) {
			return null;
		}

		try {
			const netDevPath = path.join(this.hostProcPath, 'net/dev');
			if (!fs.existsSync(netDevPath)) {
				return null;
			}

			const netDev = fs.readFileSync(netDevPath, 'utf8');
			const lines = netDev.split('\n').slice(2); // Skip header lines
			
			const interfaces = [];
			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;
				
				const parts = trimmed.split(/\s+/);
				if (parts.length >= 17) {
					const ifaceName = parts[0].replace(':', '');
					
					// Skip loopback and virtual interfaces
					if (ifaceName !== 'lo' && 
						!ifaceName.includes('docker') && 
						!ifaceName.includes('veth') && 
						!ifaceName.includes('br-') &&
						!ifaceName.includes('tailscale')) {
						
						const rxBytes = parseInt(parts[1]) || 0;
						const txBytes = parseInt(parts[9]) || 0;
						
						// Determine interface priority and type
						let priority = 0;
						let type = 'Unknown';
						
						if (ifaceName.startsWith('wl') || ifaceName.startsWith('wlan') || ifaceName.startsWith('wifi')) {
							priority = 10; // Highest priority for WiFi
							type = 'WiFi';
						} else if (ifaceName.startsWith('en') || ifaceName.startsWith('eth')) {
							priority = 5; // Medium priority for Ethernet
							type = 'Ethernet';
						} else {
							priority = 1; // Low priority for other interfaces
							type = 'Other';
						}
						
						// Only include interfaces that have had some traffic (not completely unused)
						if (rxBytes > 0 || txBytes > 0) {
							interfaces.push({
								iface: ifaceName,
								rx_bytes: rxBytes,
								tx_bytes: txBytes,
								rx_sec: 0, // Will be calculated from previous reading
								tx_sec: 0, // Will be calculated from previous reading
								priority: priority,
								type: type
							});
						}
					}
				}
			}
			
			// Sort interfaces by priority (WiFi first, then Ethernet, then others)
			interfaces.sort((a, b) => b.priority - a.priority);
			
			// Calculate rates if we have previous data
			const now = Date.now();
			if (this.lastNetworkReading && this.lastNetworkTime) {
				const timeDiff = (now - this.lastNetworkTime) / 1000; // seconds
				
				interfaces.forEach(iface => {
					const prev = this.lastNetworkReading.find(p => p.iface === iface.iface);
					if (prev && timeDiff > 0) {
						iface.rx_sec = Math.max(0, (iface.rx_bytes - prev.rx_bytes) / timeDiff);
						iface.tx_sec = Math.max(0, (iface.tx_bytes - prev.tx_bytes) / timeDiff);
					}
				});
			}
			
			// Store current reading for next calculation
			this.lastNetworkReading = interfaces.map(iface => ({
				iface: iface.iface,
				rx_bytes: iface.rx_bytes,
				tx_bytes: iface.tx_bytes
			}));
			this.lastNetworkTime = now;
			
			if (interfaces.length > 0) {
				console.log(`🌐 Host network interfaces found: ${interfaces.length}`);
				
				// List all detected interfaces
				interfaces.forEach((iface, index) => {
					const totalTraffic = this.formatBytes(iface.rx_bytes + iface.tx_bytes);
					console.log(`  ${index + 1}. ${iface.iface} (${iface.type}): Total traffic: ${totalTraffic}`);
				});
				
				const primaryInterface = interfaces[0];
				console.log(`🏆 Primary interface: ${primaryInterface.iface} (${primaryInterface.type})`);
				
				if (primaryInterface.rx_sec > 0 || primaryInterface.tx_sec > 0) {
					console.log(`  Current traffic: ↓${this.formatBytes(primaryInterface.rx_sec)}/s ↑${this.formatBytes(primaryInterface.tx_sec)}/s`);
				}
			} else {
				console.log("⚠️ No active network interfaces found on host");
			}
			
			return interfaces;
		} catch (error) {
			console.error("❌ Error reading host network info:", error);
		}
		
		return null;
	}
}

module.exports = new SystemMonitor();
