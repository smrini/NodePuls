export interface SystemData {
	timestamp: number;
	cpu: {
		usage: number;
		load: number[];
		cores: number;
		speed: number;
		temperature: number;
	};
	memory: {
		total: number;
		used: number;
		free: number;
		percentage: number;
	};
	disk: {
		total: number;
		used: number;
		free: number;
		percentage: number;
	};
	network: {
		rx_sec: number;
		tx_sec: number;
	};
	uptime: number;
}

export interface HistoryEntry {
	timestamp: string;
	status: string;
	responseTime: number | null;
}

export interface Website {
	id: string;
	name: string;
	url: string;
	status: "up" | "down" | "checking";
	responseTime?: number;
	lastCheck: number;
	upSince: number | null;
	uptime: number;
	history?: HistoryEntry[];
}

export interface ChartDataPoint {
	time: string;
	cpu: number;
	memory: number;
	network_rx: number;
	network_tx: number;
}
