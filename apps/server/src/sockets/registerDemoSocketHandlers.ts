import type { Server, Socket } from 'socket.io'

/**
 * Minimal example handler showing the registration pattern this project
 * follows: one `registerXSocketHandlers(io, socket)` function per feature
 * area, called from `index.ts` inside `io.on('connection', ...)`. Replace
 * this with real feature handlers as the app grows.
 */
export function registerDemoSocketHandlers(io: Server, socket: Socket) {
  socket.on('ping', () => {
    socket.emit('pong', { time: Date.now() })
  })
}
