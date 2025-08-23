// Load environment variables first using centralized loader
const path = require("path");
const EnvLoader = require("../env-loader");
new EnvLoader(__dirname);

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cron = require("node-cron");

const systemMonitor = require("./services/systemMonitor");
const uptimeMonitor = require("./services/uptimeMonitor");
const config = require("../config");

const app = express();
const server = http.createServer(app);

// Use CORS origin from environment configuration
const corsOrigin = config.server.corsOrigin;
console.log(`🔍 DEBUG - CLIENT_PORT: ${process.env.CLIENT_PORT}`);
console.log(`🔍 DEBUG - Config CORS Origin: ${corsOrigin}`);
console.log(`Server allowing CORS from: ${corsOrigin}`);

const io = socketIo(server, {
	cors: {
		origin: corsOrigin,
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// Middleware
// Temporarily disable Helmet to test CSP issues
// app.use(helmet());
app.use(compression());
app.use(
	cors({
		origin: corsOrigin,
		credentials: true,
	})
);
app.use(express.json());

// Serve static files from React build
const publicPath = path.join(__dirname, "public");
console.log(`📁 Serving static files from: ${publicPath}`);

// Check if index.html exists
const fs = require("fs");
const indexPath = path.join(publicPath, "index.html");
if (fs.existsSync(indexPath)) {
	console.log(`✅ Found index.html at: ${indexPath}`);
} else {
	console.log(`❌ Missing index.html at: ${indexPath}`);
	console.log(`💡 Run 'npm run build' to create the React build files`);
	try {
		console.log(
			`📂 Public directory contents:`,
			fs.readdirSync(publicPath).join(", ")
		);
	} catch (e) {
		console.log(`❌ Public directory doesn't exist: ${publicPath}`);
		console.log(`💡 Run 'npm run build' to create the React build files`);
	}
}

app.use(express.static(publicPath));

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

// Serve React app for all other routes
app.get("*", (req, res) => {
	const indexPath = path.join(__dirname, "public", "index.html");
	
	// Check if the file exists before trying to serve it
	const fs = require("fs");
	if (fs.existsSync(indexPath)) {
		console.log(`📄 Serving index.html for ${req.url} from: ${indexPath}`);
		res.sendFile(indexPath, (err) => {
			if (err) {
				console.error(`❌ Error serving index.html:`, err);
				res.status(500).send("Error loading page");
			}
		});
	} else {
		res.status(404).json({
			error: "React app not built",
			message: "Run 'npm run build' to create the React build files",
			endpoints: {
				health: "/api/health",
				config: "/api/config",
				system: "/api/system",
				websites: "/api/websites",
			},
		});
	}
});

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
