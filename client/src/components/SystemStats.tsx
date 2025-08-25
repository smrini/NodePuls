/**
 * SystemStats Component with Dropdown Functionality
 * 
 * Features:
 * - Displays real-time system statistics (CPU, Memory, Disk, Network)
 * - Dropdown menus for Disk and Network cards when multiple options are available
 * - Click outside to close dropdowns
 * - Active state highlighting for selected options
 * - Smooth animations and responsive design
 * - Dynamic content updates based on selected disk/network interface
 */

import React, { useState, useEffect, useRef } from "react";
import { SystemData, DiskInfo, NetworkInterface } from "../types";
import { Cpu, HardDrive, MemoryStick, Network, ChevronDown } from "lucide-react";

interface SystemStatsProps {
	systemData: SystemData | null;
	onNetworkInterfaceChange?: (networkInterface: NetworkInterface | null) => void;
}

const SystemStats: React.FC<SystemStatsProps> = ({ systemData, onNetworkInterfaceChange }) => {
	const [selectedDisk, setSelectedDisk] = useState<DiskInfo | null>(null);
	const [selectedNetwork, setSelectedNetwork] = useState<NetworkInterface | null>(null);
	const [diskDropdownOpen, setDiskDropdownOpen] = useState(false);
	const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
	
	const diskDropdownRef = useRef<HTMLDivElement>(null);
	const networkDropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (diskDropdownRef.current && !diskDropdownRef.current.contains(event.target as Node)) {
				setDiskDropdownOpen(false);
			}
			if (networkDropdownRef.current && !networkDropdownRef.current.contains(event.target as Node)) {
				setNetworkDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Set default selections when systemData changes
	useEffect(() => {
		if (systemData?.disks && systemData.disks.length > 0) {
			if (!selectedDisk) {
				// Find the disk that matches the current primary disk or use the first one
				const primaryDisk = systemData.disks.find(disk => 
					disk.total === systemData.disk.total && 
					disk.used === systemData.disk.used
				) || systemData.disks[0];
				setSelectedDisk(primaryDisk);
			} else {
				// Update the selected disk with latest data
				const updatedDisk = systemData.disks.find(disk => disk.id === selectedDisk.id);
				if (updatedDisk) {
					setSelectedDisk(updatedDisk);
				}
			}
		}
		
		if (systemData?.networkInterfaces && systemData.networkInterfaces.length > 0) {
			if (!selectedNetwork) {
				// Find the network interface that matches current data or use the first one
				const primaryNetwork = systemData.networkInterfaces.find(iface => 
					iface.rx_sec === systemData.network.rx_sec && 
					iface.tx_sec === systemData.network.tx_sec
				) || systemData.networkInterfaces[0];
				setSelectedNetwork(primaryNetwork);
				onNetworkInterfaceChange?.(primaryNetwork);
			} else {
				// Update the selected network with latest data
				const updatedNetwork = systemData.networkInterfaces.find(iface => iface.id === selectedNetwork.id);
				if (updatedNetwork) {
					setSelectedNetwork(updatedNetwork);
					onNetworkInterfaceChange?.(updatedNetwork);
				}
			}
		}
	}, [systemData]);

	// Get current disk data (either selected or fallback to primary)
	const getCurrentDiskData = () => {
		if (selectedDisk) {
			return {
				total: selectedDisk.total,
				used: selectedDisk.used,
				free: selectedDisk.free,
				percentage: selectedDisk.percentage
			};
		}
		return systemData?.disk || { total: 0, used: 0, free: 0, percentage: 0 };
	};

	// Get current network data (either selected or fallback to primary)
	const getCurrentNetworkData = () => {
		if (selectedNetwork) {
			return {
				rx_sec: selectedNetwork.rx_sec,
				tx_sec: selectedNetwork.tx_sec
			};
		}
		return systemData?.network || { rx_sec: 0, tx_sec: 0 };
	};
	if (
		!systemData ||
		!systemData.cpu ||
		!systemData.memory ||
		!systemData.disk ||
		!systemData.network
	) {
		return (
			<div className="system-stats loading">
				<div className="loading-message">Loading system data...</div>
			</div>
		);
	}

	const formatBytes = (bytes: number) => {
		const sizes = ["B", "KB", "MB", "GB", "TB"];
		if (bytes === 0) return "0 B";
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${
			sizes[i]
		}`;
	};

	const formatSpeed = (bytesPerSec: number) => {
		return `${formatBytes(bytesPerSec)}/s`;
	};

	const getUsageColor = (percentage: number) => {
		if (percentage < 50) return "good";
		if (percentage < 80) return "warning";
		return "critical";
	};

	const getTemperatureColor = (temp: number) => {
		if (temp < 50) return "temp-normal";
		if (temp < 70) return "temp-warm";
		return "temp-hot";
	};

	// Handle keyboard navigation for dropdowns
	const handleKeyDown = (event: React.KeyboardEvent, dropdownType: 'disk' | 'network') => {
		if (event.key === 'Escape') {
			if (dropdownType === 'disk') {
				setDiskDropdownOpen(false);
			} else {
				setNetworkDropdownOpen(false);
			}
		}
	};

	return (
		<div className="system-stats">
			<div className="stat-card">
				<div className="stat-header">
					<div>
						<Cpu size={20} />
						<span>CPU</span>
					</div>
				</div>
				<div className="stat-content">
					<div className="stat-value">
						<span
							className={`percentage ${getUsageColor(
								systemData.cpu.usage ?? 0
							)}`}>
							{(systemData.cpu.usage ?? 0).toFixed(1)}%
						</span>
					</div>
					<div className="stat-details">
						<div className="detail">
							<span>Cores: {systemData.cpu.cores ?? 0}</span>
						</div>
						<div className="detail">
							<span>
								Speed: {(systemData.cpu.speed ?? 0).toFixed(1)}{" "}
								GHz
							</span>
						</div>
						<div className="detail">
							<span>
								Temp:{" "}
								<span
									className={`${getTemperatureColor(
										systemData.cpu.temperature ?? 0
									)}`}>
									{(systemData.cpu.temperature ?? 0).toFixed(
										1
									)}
									°C
								</span>
							</span>
						</div>
						<div className="progress-bar">
							<div
								className={`progress-fill ${getUsageColor(
									systemData.cpu.usage ?? 0
								)}`}
								style={{
									width: `${systemData.cpu.usage ?? 0}%`,
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className={`stat-card ${diskDropdownOpen ? 'dropdown-open' : ''}`}>
				<div className="stat-header">
					<div>
						<HardDrive size={20} />
						<span>Disk</span>
					</div>
					{systemData?.disks && systemData.disks.length > 1 && (
						<div className="stat-dropdown" ref={diskDropdownRef}>
							<button
								className="dropdown-toggle"
								onClick={() => setDiskDropdownOpen(!diskDropdownOpen)}
								onKeyDown={(e) => handleKeyDown(e, 'disk')}
								title="Select disk">
								<ChevronDown size={16} className={diskDropdownOpen ? 'rotated' : ''} />
							</button>
							{diskDropdownOpen && (
								<div className="dropdown-menu">
									{systemData.disks.map((disk) => (
										<button
											key={disk.id}
											className={`dropdown-item ${selectedDisk?.id === disk.id ? 'active' : ''}`}
											onClick={() => {
												setSelectedDisk(disk);
												setDiskDropdownOpen(false);
											}}>
											<div className="dropdown-item-main">
												<span className="dropdown-item-name">{disk.name}</span>
												<span className="dropdown-item-detail">{disk.fs}</span>
											</div>
											<span className="dropdown-item-usage">{disk.percentage.toFixed(1)}%</span>
										</button>
									))}
								</div>
							)}
						</div>
					)}
				</div>
				<div className="stat-content">
					<div className="stat-value">
						<span
							className={`percentage ${getUsageColor(
								getCurrentDiskData().percentage ?? 0
							)}`}>
							{(getCurrentDiskData().percentage ?? 0).toFixed(1)}%
						</span>
					</div>
					<div className="stat-details">
						<div className="detail">
							<span>
								Used: {formatBytes(getCurrentDiskData().used ?? 0)}
							</span>
						</div>
						<div className="detail">
							<span>
								Total: {formatBytes(getCurrentDiskData().total ?? 0)}
							</span>
						</div>
						{selectedDisk && (
							<div className="detail">
								<span className="selected-device">
									{selectedDisk.name}
								</span>
							</div>
						)}
						<div className="progress-bar">
							<div
								className={`progress-fill ${getUsageColor(
									getCurrentDiskData().percentage ?? 0
								)}`}
								style={{
									width: `${
										getCurrentDiskData().percentage ?? 0
									}%`,
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="stat-card">
				<div className="stat-header">
					<div>
						<MemoryStick size={20} />
						<span>Memory</span>
					</div>
				</div>
				<div className="stat-content">
					<div className="stat-value">
						<span
							className={`percentage ${getUsageColor(
								systemData.memory.percentage ?? 0
							)}`}>
							{(systemData.memory.percentage ?? 0).toFixed(1)}%
						</span>
					</div>
					<div className="stat-details">
						<div className="detail">
							<span>
								Used: {formatBytes(systemData.memory.used ?? 0)}
							</span>
						</div>
						<div className="detail">
							<span>
								Total:{" "}
								{formatBytes(systemData.memory.total ?? 0)}
							</span>
						</div>
						<div className="progress-bar">
							<div
								className={`progress-fill ${getUsageColor(
									systemData.memory.percentage ?? 0
								)}`}
								style={{
									width: `${
										systemData.memory.percentage ?? 0
									}%`,
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className={`stat-card ${networkDropdownOpen ? 'dropdown-open' : ''}`}>
				<div className="stat-header">
					<div>
						<Network size={20} />
						<span>Network</span>
					</div>
					{systemData?.networkInterfaces && systemData.networkInterfaces.length > 1 && (
						<div className="stat-dropdown" ref={networkDropdownRef}>
							<button
								className="dropdown-toggle"
								onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
								onKeyDown={(e) => handleKeyDown(e, 'network')}
								title="Select network interface">
								<ChevronDown size={16} className={networkDropdownOpen ? 'rotated' : ''} />
							</button>
							{networkDropdownOpen && (
								<div className="dropdown-menu">
									{systemData.networkInterfaces.map((iface) => (
										<button
											key={iface.id}
											className={`dropdown-item ${selectedNetwork?.id === iface.id ? 'active' : ''}`}
											onClick={() => {
												setSelectedNetwork(iface);
												setNetworkDropdownOpen(false);
												onNetworkInterfaceChange?.(iface);
											}}>
											<div className="dropdown-item-main">
												<span className="dropdown-item-name">{iface.name}</span>
												<span className="dropdown-item-detail">{iface.type}</span>
											</div>
											<span className="dropdown-item-usage">
												{formatSpeed(iface.rx_sec + iface.tx_sec)}
											</span>
										</button>
									))}
								</div>
							)}
						</div>
					)}
				</div>
				<div className="stat-content">
					<div className="stat-details">
						<div className="detail">
							<span>
								↓ {formatSpeed(getCurrentNetworkData().rx_sec ?? 0)}
							</span>
						</div>
						<div className="detail">
							<span>
								↑ {formatSpeed(getCurrentNetworkData().tx_sec ?? 0)}
							</span>
						</div>
						{selectedNetwork && (
							<div className="detail">
								<span className="selected-device">
									{selectedNetwork.name}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SystemStats;
