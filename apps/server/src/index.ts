import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { Server } from 'socket.io'
import { config } from './config.js'
import { healthRouter } from './routes/health.route.js'
import { registerDemoSocketHandlers } from './sockets/registerDemoSocketHandlers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: config.corsOrigin ? { origin: config.corsOrigin } : undefined,
})

if (config.security.enableHelmet) app.use(helmet())
app.use(cors(config.corsOrigin ? { origin: config.corsOrigin } : undefined))
app.use(compression({ level: config.performance.compressionLevel }))
app.use(express.json())

app.use('/api/health', healthRouter)

// Built client assets land here via scripts/copy-build.js — see README.
const publicDir = path.join(__dirname, '..', 'public')
app.use(express.static(publicDir))
app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')))

io.on('connection', (socket) => {
  registerDemoSocketHandlers(io, socket)
})

httpServer.listen(config.port, () => {
  console.info(`NodePuls server listening on port ${config.port} (${config.nodeEnv})`)
})
