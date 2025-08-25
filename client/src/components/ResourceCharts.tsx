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

	const formatYAxis = (value: number) => `${value.toFixed(1)}%`;
	const formatNetworkYAxis = (value: number) => `${value.toFixed(2)} MB/s`;

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
					<LineChart data={data}>
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
							formatter={(value: number, name: string) => [
								`${value.toFixed(2)} MB/s`,
								name === "Download" ? "Download" : "Upload",
							]}
						/>
						<Legend />
						<Line
							type="monotone"
							dataKey="network_rx"
							stroke="#F59E0B"
							strokeWidth={2}
							dot={false}
							name="Download"
						/>
						<Line
							type="monotone"
							dataKey="network_tx"
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
