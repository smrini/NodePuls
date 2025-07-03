const si = require("systeminformation");

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
	}

	async getSystemInfo() {
		try {
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

			// Get primary disk (Windows uses C:, Linux uses /)
			const primaryDisk = disk.find(
				(d) =>
					d.mount === "/" ||
					d.mount === "C:" ||
					d.mount.includes("C:") ||
					d.fs === "C:"
			) ||
				disk[0] || {
					size: 0,
					used: 0,
					available: 0,
					use: 0,
				};

			// console.log('Primary disk:', JSON.stringify(primaryDisk, null, 2));
			const systemData = {
				timestamp: Date.now(),
				cpu: {
					usage: cpu.currentLoad || 0,
					load: cpu.avgLoad || [0, 0, 0],
					cores: cpu.cpus?.length || 0,
					speed: cpuInfo.speed || 2.0, // Keep as GHz
					temperature: this.extractTemperature(temp), // Use helper method to get temperature
				},
				memory: {
					total: memory.total || 0,
					used: memory.used || 0,
					free: memory.free || 0,
					percentage:
						memory.total > 0
							? (memory.used / memory.total) * 100
							: 0,
				},
				disk: {
					total: primaryDisk.size || 0,
					used: primaryDisk.used || 0,
					free: primaryDisk.available || 0,
					percentage: primaryDisk.use || 0,
				},
				network: {
					rx_sec: network[0]?.rx_sec || 0,
					tx_sec: network[0]?.tx_sec || 0,
				},
				uptime: time.uptime || 0,
			};

			// Add to history
			this.addToHistory(systemData);

			return systemData;
		} catch (error) {
			console.error("Error getting system info:", error);
			throw error;
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
}

module.exports = new SystemMonitor();
