import React, { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { SystemData, Website, ChartDataPoint, NetworkInterface } from "../types";
import SystemStats from "./SystemStats";
import ResourceCharts from "./ResourceCharts";
import WebsiteMonitor from "./WebsiteMonitor";
import ConnectionStatus from "./ConnectionStatus";
import { MoreVertical, Download, Upload } from "lucide-react";
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
	const [shouldStretchWebsites, setShouldStretchWebsites] = useState<boolean>(false);
	const [websiteDropdownOpen, setWebsiteDropdownOpen] = useState(false);
	
	const statsRef = useRef<HTMLElement>(null);
	const chartsRef = useRef<HTMLElement>(null);
	const websitesRef = useRef<HTMLElement>(null);
	const websiteDropdownRef = useRef<HTMLDivElement>(null);

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

	// Effect to handle dynamic height adjustment for websites section
	useEffect(() => {
		const checkHeightAndAdjust = () => {
			if (!statsRef.current || !chartsRef.current) return;

			const statsHeight = statsRef.current.offsetHeight;
			const chartsHeight = chartsRef.current.offsetHeight;
			const totalLeftColumnHeight = statsHeight + chartsHeight + 32; // +32 for gap
			
			// Get available viewport height (minus header and padding)
			const availableHeight = window.innerHeight - 140; // Approximate header + padding
			
			// If left column content exceeds available height, stretch websites section
			const shouldStretch = totalLeftColumnHeight > availableHeight;
			setShouldStretchWebsites(shouldStretch);
		};

		// Initial check
		checkHeightAndAdjust();

		// Check on window resize
		const handleResize = () => {
			// Use setTimeout to debounce resize events
			setTimeout(checkHeightAndAdjust, 100);
		};

		window.addEventListener('resize', handleResize);

		// Also check when system data changes (which might affect content height)
		const timeoutId = setTimeout(checkHeightAndAdjust, 100);

		return () => {
			window.removeEventListener('resize', handleResize);
			clearTimeout(timeoutId);
		};
	}, [systemData, websites]); // Re-run when data changes

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (websiteDropdownRef.current && !websiteDropdownRef.current.contains(event.target as Node)) {
				setWebsiteDropdownOpen(false);
			}
		};

		if (websiteDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [websiteDropdownOpen]);

	const handleExportWebsites = () => {
		const exportData = websites.map(website => ({
			name: website.name,
			url: website.url
		}));
		
		const dataStr = JSON.stringify(exportData, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		
		const link = document.createElement('a');
		link.href = URL.createObjectURL(dataBlob);
		link.download = `nodepuls-websites-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		
		setWebsiteDropdownOpen(false);
	};

	const handleImportWebsites = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			
			const reader = new FileReader();
			reader.onload = (event) => {
				try {
					const importData = JSON.parse(event.target?.result as string);
					
					if (!Array.isArray(importData)) {
						alert('Invalid file format. Expected an array of websites.');
						return;
					}
					
					// Validate data structure
					const validWebsites = importData.filter(item => 
						item && typeof item === 'object' && 
						typeof item.name === 'string' && 
						typeof item.url === 'string' &&
						item.name.trim() && item.url.trim()
					);
					
					if (validWebsites.length === 0) {
						alert('No valid websites found in the file.');
						return;
					}
					
					// Add websites via socket
					if (socket) {
						validWebsites.forEach(website => {
							let url = website.url.trim();
							if (!url.startsWith("http://") && !url.startsWith("https://")) {
								url = "http://" + url;
							}
							
							socket.emit("addWebsite", {
								name: website.name.trim(),
								url: url
							});
						});
						
						alert(`Successfully imported ${validWebsites.length} website(s).`);
					}
				} catch (error) {
					alert('Error parsing JSON file. Please check the file format.');
				}
			};
			reader.readAsText(file);
		};
		
		input.click();
		setWebsiteDropdownOpen(false);
	};

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
					<div className="logo-container">
						<img src="/nodepuls.svg" alt="NodePuls - Homelab Monitoring" className="logo" />
					</div>
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
					<section ref={statsRef} className="stats-section">
						<div className="section-header">
							<h2>System Overview</h2>
						</div>
						<SystemStats 
							systemData={systemData} 
							onNetworkInterfaceChange={setSelectedNetworkInterface}
						/>
					</section>

					<section ref={chartsRef} className="charts-section">
						<div className="section-header">
							<h2>Resource Usage</h2>
						</div>
						<ResourceCharts 
							data={chartData} 
							selectedNetworkInterface={selectedNetworkInterface}
						/>
					</section>

					<section 
						ref={websitesRef} 
						className={`websites-section ${shouldStretchWebsites ? 'stretch-to-content' : ''}`}
					>
						<div className="section-header">
							<h2>Website Monitoring</h2>
							<div className="section-actions">
								<div className="dropdown-container" ref={websiteDropdownRef}>
									<button
										className="ExportImportButton"
										onClick={() => setWebsiteDropdownOpen(!websiteDropdownOpen)}
										title="Export/Import Options">
										<MoreVertical size={16} />
									</button>
									
									{websiteDropdownOpen && (
										<div className="dropdown-menu">
											<button
												className="dropdown-item"
												onClick={handleExportWebsites}
												disabled={websites.length === 0}>
												<Download size={14} />
												Export
											</button>
											<button
												className="dropdown-item"
												onClick={handleImportWebsites}>
												<Upload size={14} />
												Import
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
						<div className="websites-content">
							<WebsiteMonitor websites={websites} socket={socket} />
						</div>
					</section>
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
