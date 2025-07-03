// Load environment variables first
require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const cron = require("node-cron");

const systemMonitor = require("./services/systemMonitor");
const uptimeMonitor = require("./services/uptimeMonitor");
const config = require("../config");

const app = express();
const server = http.createServer(app);

// Allow connections from the client development server (port 6000)
// In production, we'll use the config.server.corsOrigin setting
const developmentClientUrl = "http://localhost:6000";
console.log(
	`Server allowing CORS from: ${
		process.env.NODE_ENV === "development"
			? developmentClientUrl
			: config.server.corsOrigin
	}`
);

const io = socketIo(server, {
	cors: {
		origin:
			process.env.NODE_ENV === "development"
				? [developmentClientUrl]
				: config.server.corsOrigin,
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(
	cors({
		origin:
			process.env.NODE_ENV === "development"
				? developmentClientUrl
				: config.server.corsOrigin,
		credentials: true,
	})
);
app.use(express.json());

// Serve static files from React build
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "public")));
}

// API Routes
app.get("/api/config", (req, res) => {
	res.json(config.client);
});

app.get("/api/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/system", async (req, res) => {
	try {
		const systemInfo = await systemMonitor.getSystemInfo();
		res.json(systemInfo);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch system information" });
	}
});

app.get("/api/websites", async (req, res) => {
	try {
		const websites = await uptimeMonitor.getWebsites();
		res.json(websites);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch websites" });
	}
});

app.post("/api/websites", async (req, res) => {
	const { name, url } = req.body;
	if (!name || !url) {
		return res.status(400).json({ error: "Name and URL are required" });
	}

	try {
		const website = await uptimeMonitor.addWebsite(name, url);
		res.json(website);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

app.delete("/api/websites/:id", async (req, res) => {
	const { id } = req.params;
	try {
		await uptimeMonitor.removeWebsite(id);
		res.json({ message: "Website removed successfully" });
	} catch (error) {
		res.status(404).json({ error: "Website not found" });
	}
});

// Socket.IO connection handling
io.on("connection", async (socket) => {
	console.log("Client connected:", socket.id);

	// Send initial data
	try {
		socket.emit("websites", await uptimeMonitor.getWebsites());
	} catch (error) {
		console.error("Error fetching initial websites for socket:", error);
	}

	// Handle adding new website
	socket.on("addWebsite", async (data) => {
		const { name, url } = data;
		if (!name || !url) {
			socket.emit("error", { message: "Name and URL are required" });
			return;
		}

		try {
			await uptimeMonitor.addWebsite(name, url);
			io.emit("websites", await uptimeMonitor.getWebsites());
		} catch (error) {
			socket.emit("error", { message: error.message });
		}
	});

	// Handle removing website
	socket.on("removeWebsite", async (id) => {
		try {
			await uptimeMonitor.removeWebsite(id);
			io.emit("websites", await uptimeMonitor.getWebsites());
		} catch (error) {
			socket.emit("error", { message: error.message });
		}
	});

	// Handle website reordering
	socket.on("updateWebsiteOrder", async (websiteIds) => {
		try {
			// This is a simple implementation that doesn't persist the order
			// For now we'll just emit the updated list
			// TODO: Add persistence of website order if needed
			console.log("Received updated website order:", websiteIds);
			const websites = await uptimeMonitor.getWebsites();

			// We won't modify the backend order for now, but just log that we received it
			// In a real implementation, you'd want to save this order to the database

			// Just re-emit the current websites - in a real implementation,
			// you'd reorder them according to the provided IDs first
			io.emit("websites", websites);
		} catch (error) {
			socket.emit("error", { message: error.message });
		}
	});

	// Handle updating website
	socket.on("updateWebsite", async (data) => {
		const { id, name, url } = data;
		if (!id || !name || !url) {
			socket.emit("error", { message: "ID, name and URL are required" });
			return;
		}

		try {
			await uptimeMonitor.updateWebsite(id, name, url);
			io.emit("websites", await uptimeMonitor.getWebsites());
		} catch (error) {
			socket.emit("error", { message: error.message });
		}
	});

	// Handle clearing website history
	socket.on("clearWebsiteHistory", async (data) => {
		const { id } = data;
		if (!id) {
			socket.emit("error", { message: "Website ID is required" });
			return;
		}

		try {
			await uptimeMonitor.clearWebsiteHistory(id);
			io.emit("websites", await uptimeMonitor.getWebsites());
		} catch (error) {
			socket.emit("error", { message: error.message });
		}
	});

	socket.on("disconnect", () => {
		console.log("Client disconnected:", socket.id);
	});
});

// Real-time system monitoring
const startSystemMonitoring = () => {
	setInterval(async () => {
		try {
			const systemInfo = await systemMonitor.getSystemInfo();
			io.emit("systemUpdate", systemInfo);
		} catch (error) {
			console.error("System monitoring error:", error);
		}
	}, config.monitoring.interval);
};

// Schedule website uptime checks
cron.schedule("*/1 * * * *", async () => {
	console.log("Running scheduled uptime check...");
	await uptimeMonitor.checkAllWebsites();
	io.emit("websites", await uptimeMonitor.getWebsites());
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === "production") {
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "public", "index.html"));
	});
}

const startServer = async () => {
	try {
		// Initialize database and monitors
		await uptimeMonitor.init();

		server.listen(config.server.port, () => {
			console.log(
				`🚀 Homelab Dashboard running on port ${config.server.port}`
			);
			console.log(
				`📊 System monitoring interval: ${config.monitoring.interval}ms`
			);

			// Start monitoring
			startSystemMonitoring();

			// Initial website check on startup
			console.log("Performing initial website check...");
			uptimeMonitor.checkAllWebsites();
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();
