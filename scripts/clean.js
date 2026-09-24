import { rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const targets = ['apps/client/dist', 'apps/server/dist', 'apps/server/public']

for (const target of targets) {
  rmSync(path.join(root, target), { recursive: true, force: true })
  console.info(`Removed ${target}`)
}
