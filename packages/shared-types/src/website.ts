export type WebsiteStatus = 'up' | 'down' | 'checking' | 'unknown'

export interface Website {
  id: string
  name: string
  url: string
  status: WebsiteStatus
  responseTime: number | null
  upSince: string | null
}
