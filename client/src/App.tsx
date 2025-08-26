import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Dashboard from "./components/Dashboard";
import { SystemData, Website } from "./types";
import "./App.css";

function App() {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [systemData, setSystemData] = useState<SystemData | null>(null);
	const [websites, setWebsites] = useState<Website[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const [config, setConfig] = useState<any>(null);

	useEffect(() => {
		const fetchConfig = async () => {
			try {
				// In Docker/production, use relative URL (same origin)
				// This works because both frontend and API are served from same port
				const configUrl = "/api/config";

				const response = await fetch(configUrl);

				if (!response.ok) {
					throw new Error(
						`Failed to fetch config: ${response.status}`
					);
				}

				const configData = await response.json();
				console.log("Fetched config:", configData);
				setConfig(configData);
			} catch (error) {
				console.error("Error fetching client configuration:", error);
				// Fallback to default configuration
				const serverPort = process.env.REACT_APP_SERVER_PORT || '3050';
				setConfig({
					socketUrl:
						process.env.REACT_APP_SOCKET_URL ||
						`http://localhost:${serverPort}`,
					apiBaseUrl:
						process.env.REACT_APP_API_BASE_URL ||
						`http://localhost:${serverPort}`,
					chartUpdateInterval: parseInt(
						process.env.REACT_APP_CHART_UPDATE_INTERVAL || "5000"
					),
					defaultTimeRange: parseInt(
						process.env.REACT_APP_DEFAULT_TIME_RANGE || "60"
					),
				});
			}
		};

		fetchConfig();
	}, []);

	useEffect(() => {
		if (!config) {
			return;
		}

		// Connect to Socket.IO server using relative URL (same origin)
		// This automatically uses the current window.location origin
		const newSocket = io();
		setSocket(newSocket);

		// Connection handlers
		newSocket.on("connect", () => {
			setIsConnected(true);
			console.log("Connected to server");
		});

		newSocket.on("disconnect", () => {
			setIsConnected(false);
			console.log("Disconnected from server");
		});

		// Data handlers
		newSocket.on("systemUpdate", (data: SystemData) => {
			setSystemData(data);
		});

		newSocket.on("websites", (data: Website[]) => {
			setWebsites(data);
		});

		// Cleanup on unmount
		return () => {
			newSocket.close();
		};
	}, [config]);

	return (
		<div className="App">
			<Dashboard
				systemData={systemData}
				websites={websites}
				isConnected={isConnected}
				socket={socket}
			/>
		</div>
	);
}

export default App;
