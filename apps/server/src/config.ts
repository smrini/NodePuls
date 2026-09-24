import 'dotenv/config'

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return value.toLowerCase() === 'true'
}

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const config = {
  port: num(process.env.PORT, 3020),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN || undefined,

  security: {
    enableHelmet: bool(process.env.ENABLE_HELMET, true),
  },

  performance: {
    compressionLevel: num(process.env.COMPRESSION_LEVEL, 6),
  },
}
