import React from "react";
import { Activity, Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
	isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
	return (
		<div
			className={`connection-status ${
				isConnected ? "connected" : "disconnected"
			}`}>
			{isConnected ? (
				<>
					<Wifi size={16} />
					<span>Connected</span>
				</>
			) : (
				<>
					<WifiOff size={16} />
					<span>Disconnected</span>
				</>
			)}
			<Activity
				size={12}
				className={`pulse ${isConnected ? "active" : ""}`}
			/>
		</div>
	);
};

export default ConnectionStatus;
