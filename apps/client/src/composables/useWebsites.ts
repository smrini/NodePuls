import { ref } from 'vue'
import type { Website } from '@nodepuls/shared-types'

const seedWebsites: Website[] = [
  {
    id: '1',
    name: 'Example Website',
    url: 'https://example.com',
    status: 'up',
    responseTime: 120,
    upSince: new Date(Date.now() - 24 * 60 * 60 * 1000).toString(),
  },
  {
    id: '2',
    name: 'Another Website',
    url: 'https://another.com',
    status: 'down',
    responseTime: null,
    upSince: null,
  },
]

export function useWebsites() {
  const websites = ref<Website[]>([...seedWebsites])
  const expandedWebsiteId = ref<string | null>(null)

  const moveWebsite = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const nextWebsites = [...websites.value]
    const [movedWebsite] = nextWebsites.splice(fromIndex, 1)
    if (!movedWebsite) return

    nextWebsites.splice(toIndex, 0, movedWebsite)
    websites.value = nextWebsites
  }

  const toggleWebsiteExpansion = (websiteId: string) => {
    expandedWebsiteId.value = expandedWebsiteId.value === websiteId ? null : websiteId
  }

  const isWebsiteExpanded = (websiteId: string) => expandedWebsiteId.value === websiteId

  return {
    websites,
    expandedWebsiteId,
    moveWebsite,
    toggleWebsiteExpansion,
    isWebsiteExpanded,
  }
}
