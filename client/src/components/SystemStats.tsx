import React from "react";
import { SystemData } from "../types";
import { Cpu, HardDrive, MemoryStick, Network } from "lucide-react";

interface SystemStatsProps {
	systemData: SystemData | null;
}

const SystemStats: React.FC<SystemStatsProps> = ({ systemData }) => {
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

	return (
		<div className="system-stats">
			<div className="stat-card">
				<div className="stat-header">
					<Cpu size={20} />
					<span>CPU</span>
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

			<div className="stat-card">
				<div className="stat-header">
					<HardDrive size={20} />
					<span>Disk</span>
				</div>
				<div className="stat-content">
					<div className="stat-value">
						<span
							className={`percentage ${getUsageColor(
								systemData.disk.percentage ?? 0
							)}`}>
							{(systemData.disk.percentage ?? 0).toFixed(1)}%
						</span>
					</div>
					<div className="stat-details">
						<div className="detail">
							<span>
								Used: {formatBytes(systemData.disk.used ?? 0)}
							</span>
						</div>
						<div className="detail">
							<span>
								Total: {formatBytes(systemData.disk.total ?? 0)}
							</span>
						</div>
						<div className="progress-bar">
							<div
								className={`progress-fill ${getUsageColor(
									systemData.disk.percentage ?? 0
								)}`}
								style={{
									width: `${
										systemData.disk.percentage ?? 0
									}%`,
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="stat-card">
				<div className="stat-header">
					<MemoryStick size={20} />
					<span>Memory</span>
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

			<div className="stat-card">
				<div className="stat-header">
					<Network size={20} />
					<span>Network</span>
				</div>
				<div className="stat-content">
					<div className="stat-details">
						<div className="detail">
							<span>
								↓ {formatSpeed(systemData.network.rx_sec ?? 0)}
							</span>
						</div>
						<div className="detail">
							<span>
								↑ {formatSpeed(systemData.network.tx_sec ?? 0)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SystemStats;
