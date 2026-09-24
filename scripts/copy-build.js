// Copies the built Vue client into apps/server/public so the Express
// server can serve it as static files in production (same single-port
// serving model as v1).
import { cpSync, rmSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const from = path.join(root, 'apps/client/dist')
const to = path.join(root, 'apps/server/public')

if (!existsSync(from)) {
  console.error(`Client build not found at ${from} — run "pnpm build" from the repo root.`)
  process.exit(1)
}

rmSync(to, { recursive: true, force: true })
cpSync(from, to, { recursive: true })
console.info(`Copied ${from} -> ${to}`)
