import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { SystemData, Website, ChartDataPoint, NetworkInterface } from "../types";
import SystemStats from "./SystemStats";
import ResourceCharts from "./ResourceCharts";
import WebsiteMonitor from "./WebsiteMonitor";
import ConnectionStatus from "./ConnectionStatus";
import "./Dashboard.css";

interface DashboardProps {
	systemData: SystemData | null;
	websites: Website[];
	isConnected: boolean;
	socket: Socket | null;
}

const Dashboard: React.FC<DashboardProps> = ({
	systemData,
	websites,
	isConnected,
	socket,
}) => {
	const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
	const [selectedNetworkInterface, setSelectedNetworkInterface] = useState<NetworkInterface | null>(null);

	useEffect(() => {
		if (systemData) {
			// Determine which network interface to use for chart data
			let networkData = systemData.network; // Default fallback
			
			if (selectedNetworkInterface) {
				// Use the selected network interface data
				networkData = {
					rx_sec: selectedNetworkInterface.rx_sec,
					tx_sec: selectedNetworkInterface.tx_sec
				};
			} else if (systemData.networkInterfaces && systemData.networkInterfaces.length > 0) {
				// If no selection yet, try to find the primary interface or use the first one
				const primaryInterface = systemData.networkInterfaces.find(iface => 
					iface.rx_sec === systemData.network.rx_sec && 
					iface.tx_sec === systemData.network.tx_sec
				) || systemData.networkInterfaces[0];
				
				networkData = {
					rx_sec: primaryInterface.rx_sec,
					tx_sec: primaryInterface.tx_sec
				};
			}

			const newDataPoint: ChartDataPoint = {
				time: new Date(systemData.timestamp).toLocaleTimeString(),
				cpu: systemData.cpu.usage,
				memory: systemData.memory.percentage,
				network_rx: networkData.rx_sec / 1024 / 1024, // Convert to MB/s
				network_tx: networkData.tx_sec / 1024 / 1024, // Convert to MB/s
			};

			setChartData((prev) => {
				const updated = [...prev, newDataPoint];
				// Keep only last 50 data points for performance
				return updated.slice(-50);
			});
		}
	}, [systemData, selectedNetworkInterface]);

	const formatUptime = (seconds: number) => {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		if (days > 0) {
			return `${days}d ${hours}h ${minutes}m`;
		} else if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else {
			return `${minutes}m`;
		}
	};

	return (
		<div className="dashboard">
			<header className="dashboard-header">
				<div className="header-content">
					<h1>Homelab Dashboard</h1>
					{systemData && (
					<div className="uptime-info">
						<span>
							System Uptime: {formatUptime(systemData.uptime)}
						</span>
					</div>
				)}
					<ConnectionStatus isConnected={isConnected} />
				</div>
				
			</header>

			<main className="dashboard-main">
				<div className="dashboard-grid">
					<section className="stats-section">
						<h2>System Overview</h2>
						<SystemStats 
							systemData={systemData} 
							onNetworkInterfaceChange={setSelectedNetworkInterface}
						/>
					</section>

					<section className="charts-section">
						<h2>Resource Usage</h2>
						<ResourceCharts 
							data={chartData} 
							selectedNetworkInterface={selectedNetworkInterface}
						/>
					</section>

					<section className="websites-section">
						<h2>Website Monitoring</h2>
						<WebsiteMonitor websites={websites} socket={socket} />
					</section>
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
