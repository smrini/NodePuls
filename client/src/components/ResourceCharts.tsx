import React from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { ChartDataPoint, NetworkInterface } from "../types";

interface ResourceChartsProps {
	data: ChartDataPoint[];
	selectedNetworkInterface?: NetworkInterface | null;
}

const ResourceCharts: React.FC<ResourceChartsProps> = ({ data, selectedNetworkInterface }) => {
	if (data.length === 0) {
		return (
			<div className="resource-charts loading">
				<div className="loading-message">Collecting data...</div>
			</div>
		);
	}

	// Helper function to format network speed adaptively
	const formatNetworkSpeed = (mbps: number): string => {
		const bytesPerSec = mbps * 1024 * 1024; // Convert MB/s back to bytes/s
		
		if (bytesPerSec >= 1024 * 1024) {
			// >= 1 MB/s: show in MB/s
			return `${mbps.toFixed(2)} MB/s`;
		} else if (bytesPerSec >= 1024) {
			// >= 1 KB/s: show in KB/s
			const kbps = bytesPerSec / 1024;
			return `${kbps.toFixed(1)} KB/s`;
		} else {
			// < 1 KB/s: show in B/s
			return `${bytesPerSec.toFixed(0)} B/s`;
		}
	};

	// Find the maximum network speed in the current data to determine the best unit for Y-axis
	const getOptimalNetworkUnit = () => {
		if (data.length === 0) return { unit: 'MB/s', multiplier: 1, decimals: 2 };
		
		const maxSpeed = Math.max(
			...data.map(d => Math.max(d.network_rx, d.network_tx))
		);
		
		// Convert back to bytes/s to determine unit
		const maxBytesPerSec = maxSpeed * 1024 * 1024;
		
		if (maxBytesPerSec >= 1024 * 1024) {
			// Use MB/s (data is already in MB/s)
			return { unit: 'MB/s', multiplier: 1, decimals: 2 };
		} else if (maxBytesPerSec >= 1024) {
			// Use KB/s (convert MB/s to KB/s: multiply by 1024)
			return { unit: 'KB/s', multiplier: 1024, decimals: 1 };
		} else {
			// Use B/s (convert MB/s to B/s: multiply by 1024*1024)
			return { unit: 'B/s', multiplier: 1024 * 1024, decimals: 0 };
		}
	};

	const networkUnit = getOptimalNetworkUnit();

	const formatYAxis = (value: number) => `${value.toFixed(1)}%`;
	const formatNetworkYAxis = (value: number) => {
		return `${value.toFixed(networkUnit.decimals)} ${networkUnit.unit}`;
	};

	// Transform data for optimal unit display
	const transformedData = data.map(point => ({
		...point,
		network_rx_display: point.network_rx * networkUnit.multiplier,
		network_tx_display: point.network_tx * networkUnit.multiplier,
	}));

	return (
		<div className="resource-charts">
			<div className="chart-container">
				<h3>CPU & Memory Usage</h3>
				<ResponsiveContainer width="100%" height={215}>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
						<YAxis
							tickFormatter={formatYAxis}
							stroke="#9CA3AF"
							fontSize={12}
							domain={[0, 100]}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "#1F2937",
								border: "1px solid #374151",
								borderRadius: "6px",
								color: "#F9FAFB",
							}}
							formatter={(value: number, name: string) => [
								`${value.toFixed(1)}%`,
								name === "CPU" ? "CPU" : "Memory",
							]}
						/>
						<Legend />
						<Line
							type="monotone"
							dataKey="cpu"
							stroke="#3B82F6"
							strokeWidth={2}
							dot={false}
							name="CPU"
						/>
						<Line
							type="monotone"
							dataKey="memory"
							stroke="#10B981"
							strokeWidth={2}
							dot={false}
							name="Memory"
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>

			<div className="chart-container">
				<h3>
					Network Activity
					{selectedNetworkInterface && (
						<span style={{ fontSize: '0.8em', fontWeight: 'normal', color: '#9CA3AF', marginLeft: '8px' }}>
							({selectedNetworkInterface.name})
						</span>
					)}
				</h3>
				<ResponsiveContainer width="100%" height={215}>
					<LineChart data={transformedData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
						<YAxis
							tickFormatter={formatNetworkYAxis}
							stroke="#9CA3AF"
							fontSize={12}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "#1F2937",
								border: "1px solid #374151",
								borderRadius: "6px",
								color: "#F9FAFB",
							}}
							formatter={(value: number, name: string) => {
								// Convert the displayed value back to original MB/s value for formatting
								const originalMbps = value / networkUnit.multiplier;
								return [
									formatNetworkSpeed(originalMbps),
									name === "Download" ? "Download" : "Upload",
								];
							}}
						/>
						<Legend />
						<Line
							type="monotone"
							dataKey="network_rx_display"
							stroke="#F59E0B"
							strokeWidth={2}
							dot={false}
							name="Download"
						/>
						<Line
							type="monotone"
							dataKey="network_tx_display"
							stroke="#EF4444"
							strokeWidth={2}
							dot={false}
							name="Upload"
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default ResourceCharts;
