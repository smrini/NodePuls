import React, { useState, useCallback, useRef, useMemo } from "react";
import { Socket } from "socket.io-client";
import { Website, HistoryEntry } from "../types";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
	ExternalLink,
	Circle,
	Clock,
	Plus,
	X,
	ChevronDown,
	ChevronUp,
	BarChart3,
	GripVertical,
	Edit,
	Trash2,
} from "lucide-react";

interface WebsiteMonitorProps {
	websites: Website[];
	socket: Socket | null;
}

// Drag type constant
const ItemTypes = {
	WEBSITE_CARD: "website-card",
};

// Draggable website card component
interface WebsiteCardProps {
	website: Website;
	index: number;
	isExpanded: boolean;
	moveCard: (dragIndex: number, hoverIndex: number) => void;
	toggleCardExpansion: (id: string) => void;
	handleCardClick: (e: React.MouseEvent, website: Website) => void;
	getStatusIcon: (status: Website["status"]) => React.ReactNode;
	formatUrl: (url: string) => string;
	formatResponseTime: (time?: number) => string;
	formatUpSince: (upSince: number | null) => string;
	openAnalyticsModal: (website: Website) => void;
	handleRemoveWebsite: (id: string) => void;
	handleWebsiteClick: (url: string) => void;
	handleEditWebsite: (website: Website) => void;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({
	website,
	index,
	isExpanded,
	moveCard,
	toggleCardExpansion,
	handleCardClick,
	getStatusIcon,
	formatUrl,
	formatResponseTime,
	formatUpSince,
	openAnalyticsModal,
	handleRemoveWebsite,
	handleWebsiteClick,
	handleEditWebsite,
}) => {
	const ref = useRef<HTMLDivElement>(null);

	const [{ isDragging }, drag] = useDrag({
		type: ItemTypes.WEBSITE_CARD,
		item: () => ({ id: website.id, index }),
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const [, drop] = useDrop({
		accept: ItemTypes.WEBSITE_CARD,
		hover: (item: { id: string; index: number }, monitor) => {
			if (!ref.current) {
				return;
			}
			const dragIndex = item.index;
			const hoverIndex = index;

			// Don't replace items with themselves
			if (dragIndex === hoverIndex) {
				return;
			}

			// Time to actually perform the action
			moveCard(dragIndex, hoverIndex);

			// Note: we're mutating the monitor item here!
			item.index = hoverIndex;
		},
	});

	// Initialize drag and drop refs
	drag(drop(ref));

	return (
		<div
			ref={ref}
			className={`website-card compact ${
				isDragging ? "is-dragging" : ""
			}`}
			style={{ cursor: "pointer", opacity: isDragging ? 0.5 : 1 }}>
			{/* Compact Card Header */}
			<div className="card-header">
				<div
					style={{
						marginRight: "10px",
					}}
					className="drag-handle"
					onClick={(e) => e.stopPropagation()}>
					<GripVertical size={16} />
				</div>
				<div
					className="website-main-info"
					onClick={(e) => handleCardClick(e, website)}>
					<div className="website-text">
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "5px",
							}}>
							<h4 className="website-name">{website.name}</h4>
						</div>
						<p className="website-url">{formatUrl(website.url)}</p>
					</div>
				</div>

				<div className="card-actions">
					<div
								className="status-indicator"
								style={{ marginBottom: "3px" }}>
								{getStatusIcon(website.status)}
							</div>
					<button
						className="expand-btn"
						onClick={() => toggleCardExpansion(website.id)}
						title={isExpanded ? "Show less" : "Show details"}>
						{isExpanded ? (
							<ChevronUp size={16} />
						) : (
							<ChevronDown size={16} />
						)}
					</button>
				</div>
			</div>

			{/* Expanded Details */}
			{isExpanded && (
				<div className="card-details">
					<div className="details-grid">
						<div className="detail-item">
							<span className="detail-label">Status</span>
							<span
								className={`detail-value status ${website.status}`}>
								{website.status.toUpperCase()}
							</span>
						</div>

						<div className="detail-item">
							<span className="detail-label">Response Time</span>
							<span className="detail-value">
								{formatResponseTime(website.responseTime)}
							</span>
						</div>

						<div className="detail-item">
							<span className="detail-label">Up Since</span>
							<span className="detail-value">
								<Clock size={12} />
								{website.status === "up"
									? formatUpSince(website.upSince)
									: "Currently down"}
							</span>
						</div>

						<div className="detail-item">
							<span className="detail-label">URL</span>
							<span className="detail-value url-text">
								{website.url}
							</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="action-buttons">
						<button
							className="action-btn primary"
							onClick={() => handleWebsiteClick(website.url)}
							title="Visit website">
							<ExternalLink size={14} />
							Visit Site
						</button>

						<button
							className="action-btn secondary"
							onClick={() => openAnalyticsModal(website)}
							title="View analytics">
							<BarChart3 size={14} />
							Analytics
						</button>

						<div>
							<button
								className="action-btn secondary"
								onClick={() => handleEditWebsite(website)}
								title="Edit website">
								<Edit size={14} />
							</button>

							<button
								className="action-btn danger"
								onClick={() => handleRemoveWebsite(website.id)}
								title="Remove website">
								<Trash2 size={14} />
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

const WebsiteMonitor: React.FC<WebsiteMonitorProps> = ({
	websites,
	socket,
}) => {
	const [showAddForm, setShowAddForm] = useState(false);
	const [newWebsite, setNewWebsite] = useState({ name: "", url: "" });
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		website: Website | null;
		name: string;
		url: string;
	}>({ isOpen: false, website: null, name: "", url: "" });
	const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
	const [analyticsModal, setAnalyticsModal] = useState<{
		isOpen: boolean;
		website: Website | null;
	}>({ isOpen: false, website: null });
	const [websiteOrder, setWebsiteOrder] = useState<Website[]>([]);

	// Update websiteOrder when the websites prop changes
	React.useEffect(() => {
		setWebsiteOrder(websites);
	}, [websites]);

	// Get the current (updated) website data for analytics modal
	const currentAnalyticsWebsite = useMemo(() => {
		if (!analyticsModal.website) return null;
		return (
			websiteOrder.find((w) => w.id === analyticsModal.website!.id) ||
			analyticsModal.website
		);
	}, [analyticsModal.website, websiteOrder]);

	const moveCard = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			setWebsiteOrder((prevCards) => {
				const newCards = [...prevCards];
				// Remove the dragged item
				const draggedItem = newCards[dragIndex];
				// Remove it from the array
				newCards.splice(dragIndex, 1);
				// Insert it at the new position
				newCards.splice(hoverIndex, 0, draggedItem);

				// Optionally, save the new order to backend/localStorage
				if (socket) {
					socket.emit(
						"updateWebsiteOrder",
						newCards.map((card) => card.id)
					);
				}

				return newCards;
			});
		},
		[socket]
	);

	const handleAddWebsite = (e: React.FormEvent) => {
		e.preventDefault();
		if (socket && newWebsite.name && newWebsite.url) {
			// Ensure URL has a protocol (default to http if none specified)
			let url = newWebsite.url.trim();
			if (!url.startsWith("http://") && !url.startsWith("https://")) {
				url = "http://" + url;
			}

			socket.emit("addWebsite", {
				name: newWebsite.name,
				url: url,
			});
			setNewWebsite({ name: "", url: "" });
			setShowAddForm(false);
		}
	};

	const handleRemoveWebsite = (id: string) => {
		if (socket) {
			socket.emit("removeWebsite", id);
		}
	};

	const getStatusIcon = (status: Website["status"]) => {
		switch (status) {
			case "up":
				return (
					<Circle
						size={12}
						className="status-icon up"
						fill="currentColor"
					/>
				);
			case "down":
				return (
					<Circle
						size={12}
						className="status-icon down"
						fill="currentColor"
					/>
				);
			case "checking":
				return <Circle size={12} className="status-icon checking" />;
			default:
				return <Circle size={12} className="status-icon unknown" />;
		}
	};

	const formatResponseTime = (time?: number) => {
		if (!time) return "N/A";
		return `${time}ms`;
	};

	const toggleCardExpansion = (websiteId: string) => {
		setExpandedCards((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(websiteId)) {
				newSet.delete(websiteId);
			} else {
				newSet.add(websiteId);
			}
			return newSet;
		});
	};

	const formatUrl = (url: string) => {
		try {
			const urlObj = new URL(url);
			// Include port if it's not the default port for the protocol
			const isDefaultPort = 
				(urlObj.protocol === 'http:' && urlObj.port === '80') ||
				(urlObj.protocol === 'https:' && urlObj.port === '443') ||
				urlObj.port === '';
			
			return isDefaultPort ? urlObj.hostname : `${urlObj.hostname}:${urlObj.port}`;
		} catch {
			return url;
		}
	};

	// Calculate how long the site has been up
	const formatUpSince = (upSince: number | null) => {
		if (!upSince) return "Unknown";

		const now = new Date();
		const upSinceDate = new Date(upSince);
		const diffMs = now.getTime() - upSinceDate.getTime();

		// If it's less than a day, show hours
		if (diffMs < 24 * 60 * 60 * 1000) {
			const hours = Math.floor(diffMs / (60 * 60 * 1000));
			return hours === 0
				? "Less than an hour"
				: `${hours} hour${hours !== 1 ? "s" : ""}`;
		}

		// If it's less than a month, show days
		if (diffMs < 30 * 24 * 60 * 60 * 1000) {
			const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
			return `${days} day${days !== 1 ? "s" : ""}`;
		}

		// Otherwise show months
		const months = Math.floor(diffMs / (30 * 24 * 60 * 60 * 1000));
		return `${months} month${months !== 1 ? "s" : ""}`;
	};

	const handleWebsiteClick = (url: string) => {
		window.open(url, "_blank", "noopener,noreferrer");
	};

	const handleCardClick = (e: React.MouseEvent, website: Website) => {
		// Don't trigger if clicking on buttons or interactive elements
		const target = e.target as HTMLElement;
		if (
			target.closest("button") ||
			target.closest(".card-actions") ||
			target.closest(".drag-handle")
		) {
			return;
		}
		handleWebsiteClick(website.url);
	};

	const openAnalyticsModal = (website: Website) => {
		setAnalyticsModal({ isOpen: true, website });
	};

	const closeAnalyticsModal = () => {
		setAnalyticsModal({ isOpen: false, website: null });
	};

	const generateHistoryFromWebsite = (website: Website) => {
		// Use real historical data from the website
		if (!website.history || website.history.length === 0) {
			return []; // Return empty array if no history
		}

		// Convert website history to the format needed for display
		return website.history.map((entry: HistoryEntry) => {
			const timestamp = new Date(entry.timestamp);
			return {
				time: timestamp.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				}),
				uptime: website.uptime || 0,
				responseTime: entry.responseTime || 0,
				status: entry.status || "unknown",
			};
		});
	};

	const handleEditWebsite = (website: Website) => {
		setEditModal({
			isOpen: true,
			website,
			name: website.name,
			url: website.url,
		});
	};

	const handleUpdateWebsite = (e: React.FormEvent) => {
		e.preventDefault();
		if (socket && editModal.website && editModal.name && editModal.url) {
			// Ensure URL has a protocol (default to http if none specified)
			let url = editModal.url.trim();
			if (!url.startsWith("http://") && !url.startsWith("https://")) {
				url = "http://" + url;
			}

			socket.emit("updateWebsite", {
				id: editModal.website.id,
				name: editModal.name,
				url: url,
			});
			setEditModal({ isOpen: false, website: null, name: "", url: "" });
		}
	};

	const handleCancelEdit = () => {
		setEditModal({ isOpen: false, website: null, name: "", url: "" });
	};

	const handleClearHistory = (websiteId: string | undefined) => {
		if (socket && websiteId) {
			// Show confirmation dialog
			if (
				window.confirm(
					"Are you sure you want to clear all history for this website? This action cannot be undone."
				)
			) {
				socket.emit("clearWebsiteHistory", { id: websiteId });
			}
		}
	};

	// Helper function to calculate dynamic chart properties
	const calculateChartProperties = (historyData: any[]) => {
		const responseTimes = historyData
			.filter(point => point.status !== "down" && point.responseTime > 0)
			.map(point => point.responseTime);
		
		if (responseTimes.length === 0) {
			return {
				maxValue: 1000,
				goodThreshold: 200,
				okThreshold: 500,
				scale: (value: number) => Math.min(90, (value / 1000) * 85)
			};
		}
		
		const minTime = Math.min(...responseTimes);
		const maxTime = Math.max(...responseTimes);
		const avgTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
		
		// Calculate dynamic thresholds based on actual data
		const goodThreshold = Math.max(100, avgTime * 0.7); // 70% of average, min 100ms
		const okThreshold = Math.max(200, avgTime * 1.5);   // 150% of average, min 200ms
		
		// Dynamic scaling based on data range
		const chartMax = Math.max(maxTime * 1.1, okThreshold * 1.2); // 10% above max or 120% of ok threshold
		
		return {
			maxValue: chartMax,
			goodThreshold,
			okThreshold,
			minTime,
			maxTime,
			avgTime,
			scale: (value: number) => {
				if (value === 0) return 5; // Minimum height for zero values
				
				// Ensure minimum 10% height for very small values
				const minHeight = 10;
				const scaledHeight = (value / chartMax) * 80 + minHeight;
				return Math.min(90, scaledHeight);
			}
		};
	};

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="website-monitor">
				<div className="monitor-header">
					<button
						className="add-website-btn"
						onClick={() => setShowAddForm(!showAddForm)}>
						<Plus size={16} />
						Add Website
					</button>
				</div>

				{showAddForm && (
					<form
						className="add-website-form"
						onSubmit={handleAddWebsite}>
						
							<input
								type="text"
								placeholder="Website name"
								value={newWebsite.name}
								onChange={(e) =>
									setNewWebsite({
										...newWebsite,
										name: e.target.value,
									})
								}
								required
							/>
							<input
								type="text"
								placeholder="Website URL"
								value={newWebsite.url}
								onChange={(e) =>
									setNewWebsite({
										...newWebsite,
										url: e.target.value,
									})
								}
								required
							/>
							<div className="form-actions">
								<button type="submit">Add</button>
								<button
									type="button"
									onClick={() => setShowAddForm(false)}>
									Cancel
								</button>
							</div>
						</form>
					)}

				<div className="websites-grid">
					{websiteOrder.length === 0 ? (
						<div className="no-websites">
							<p>No websites being monitored</p>
							<p>Click "Add Website" to start monitoring</p>
						</div>
					) : (
						websiteOrder.map((website, index) => {
							const isExpanded = expandedCards.has(website.id);
							return (
								<WebsiteCard
									key={website.id}
									website={website}
									index={index}
									isExpanded={isExpanded}
									moveCard={moveCard}
									toggleCardExpansion={toggleCardExpansion}
									handleCardClick={handleCardClick}
									getStatusIcon={getStatusIcon}
									formatUrl={formatUrl}
									formatResponseTime={formatResponseTime}
									formatUpSince={formatUpSince}
									openAnalyticsModal={openAnalyticsModal}
									handleRemoveWebsite={handleRemoveWebsite}
									handleWebsiteClick={handleWebsiteClick}
									handleEditWebsite={handleEditWebsite}
								/>
							);
						})
					)}
				</div>

				{/* Analytics Modal */}
				{analyticsModal.isOpen && currentAnalyticsWebsite && (
					<div
						className="modal-overlay"
						onClick={closeAnalyticsModal}>
						<div
							className="modal-content analytics-modal"
							onClick={(e) => e.stopPropagation()}>
							<div className="modal-header">
								<h3>
									Analytics - {currentAnalyticsWebsite.name}
								</h3>
								<button
									className="modal-close"
									onClick={closeAnalyticsModal}>
									<X size={20} />
								</button>
							</div>{" "}
							<div className="modal-body">
								<div className="analytics-overview">
									<div className="metric-card">
										<div className="metric-value">
											{formatResponseTime(
												currentAnalyticsWebsite.responseTime
											)}
										</div>
										<div className="metric-label">
											Avg Response
										</div>
									</div>
									<div className="metric-card">
										<div className="metric-value status-text">
											{currentAnalyticsWebsite.status.toUpperCase()}
										</div>
										<div className="metric-label">
											Current Status
										</div>
									</div>
								</div>

								<div className="analytics-charts">
									<div className="chart-section">
										<h4>Response Time</h4>
										{(() => {
											const historyData = generateHistoryFromWebsite(currentAnalyticsWebsite);
											const chartProps = calculateChartProperties(historyData);
											
											return (
												<>
													<div className="chart-legend" style={{
														fontSize: '11px',
														marginBottom: '8px',
														color: '#666',
														display: 'flex',
														gap: '12px',
														flexWrap: 'wrap'
													}}>
														<span style={{ color: '#22c55e' }}>
															● Fast ≤{Math.round(chartProps.goodThreshold)}ms
														</span>
														<span style={{ color: '#f59e0b' }}>
															● OK ≤{Math.round(chartProps.okThreshold)}ms
														</span>
														<span style={{ color: '#ef4444' }}>
															● Slow &gt;{Math.round(chartProps.okThreshold)}ms
														</span>
													</div>
													<div className="simple-chart">
														{historyData.map((point: any, index: number) => (
															<div
																key={index}
																className="chart-bar"
																style={{
																	height: `${
																		point.status === "down" || point.responseTime === 0
																			? 5 // Show a small bar for down status
																			: chartProps.scale(point.responseTime)
																	}%`,
																	backgroundColor:
																		point.status === "down" || point.responseTime === 0
																			? "#ef4444" // Red for down/0ms
																			: point.responseTime <= chartProps.goodThreshold
																			? "#22c55e" // Green for fast response
																			: point.responseTime <= chartProps.okThreshold
																			? "#f59e0b" // Orange for medium response
																			: "#ef4444", // Red for slow response
																}}
																title={`${point.time}: ${
																	point.status === "down"
																		? "DOWN"
																		: `${point.responseTime.toFixed(0)}ms${
																			point.responseTime <= chartProps.goodThreshold ? " (Fast)" :
																			point.responseTime <= chartProps.okThreshold ? " (OK)" : " (Slow)"
																		}`
																}`}
															/>
														))}
													</div>
												</>
											);
										})()}
									</div>

									<div className="chart-section">
										<div className="chart-header">
											<h4>Status Log (Recent)</h4>
											<button
												className="clear-history-btn"
												onClick={() =>
													handleClearHistory(
														currentAnalyticsWebsite?.id
													)
												}
												title="Clear history">
												<Trash2 size={16} />
											</button>
										</div>
										<div className="status-log">
											{generateHistoryFromWebsite(
												currentAnalyticsWebsite
											)
												.slice(-10)
												.reverse()
												.map(
													(
														point: any,
														index: number
													) => (
														<div
															key={index}
															className="log-entry">
															<span className="log-time">
																{point.time}
															</span>
															<span
																className={`log-status ${point.status}`}>
																{point.status.toUpperCase()}
															</span>
															<span className="log-response">
																{point.responseTime.toFixed(
																	0
																)}
																ms
															</span>
														</div>
													)
												)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Edit Website Modal */}
				{editModal.isOpen && editModal.website && (
					<div className="modal-overlay" onClick={handleCancelEdit}>
						<div
							className="modal-content edit-website-modal"
							onClick={(e) => e.stopPropagation()}>
							<div className="modal-header">
								<h3>Edit Website</h3>
								<button
									className="modal-close"
									onClick={handleCancelEdit}>
									<X size={20} />
								</button>
							</div>

							<form
								className="modal-body"
								onSubmit={handleUpdateWebsite}>
								<div className="form-group">
									<input
										id="edit-website-name"
										type="text"
										value={editModal.name}
										placeholder="Website Name"
										onChange={(e) =>
											setEditModal((prev) => ({
												...prev,
												name: e.target.value,
											}))
										}
										required
									/>
								</div>

								<div className="form-group">
									<input
										id="edit-website-url"
										type="text"
										value={editModal.url}
										placeholder="Website URL"
										onChange={(e) =>
											setEditModal((prev) => ({
												...prev,
												url: e.target.value,
											}))
										}
										required
									/>
								</div>

								<div className="modal-actions">
									<button
										type="submit"
										className="action-btn primary">
										Update Website
									</button>
									<button
										type="button"
										className="action-btn secondary"
										onClick={handleCancelEdit}>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</DndProvider>
	);
};

export default WebsiteMonitor;
