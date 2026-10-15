<script setup lang="ts">
import WebsiteCard from '../components/elements/WebsiteCard.vue'
import Block from '../components/layout/Block.vue'
import SystemCard from '../components/elements/SystemCard.vue'
import { useWebsites } from '../composables/useWebsites'
import { CpuIcon, MemoryStick, HardDrive, Network } from '@lucide/vue'

defineOptions({ name: 'DashboardPage' })

const { websites, moveWebsite, toggleWebsiteExpansion, isWebsiteExpanded } = useWebsites()
</script>

<template>
  <section class="dashboard">
    <div class="dashboard-grid">
      <Block title="System Overview">
        <div class="system-stats">
          <SystemCard
            title="CPU"
            :resources="[
              { title: 'Cores', value: 4, unit: '' },
              { title: 'Threads', value: 8, unit: '' },
              { title: 'Temp', value: 54, unit: '°C' },
            ]"
            :mainValue="{ value: 42, unit: '%' }"
          >
            <CpuIcon />
          </SystemCard>
          <SystemCard
            title="Disk"
            :resources="[
              { title: 'Used', value: 5.74, unit: 'GB' },
              { title: 'Total', value: 48.91, unit: 'GB' },
            ]"
            :mainValue="{ value: 13.5, unit: '%' }"
          >
            <HardDrive :size="20" />
          </SystemCard>
          <SystemCard
            title="Memory"
            :resources="[
              { title: 'Total', value: 16, unit: 'GB' },
              { title: 'Used', value: 10, unit: 'GB' },
            ]"
            :mainValue="{ value: 62.5, unit: '%' }"
          >
            <MemoryStick :size="20" />
          </SystemCard>
          <SystemCard
            title="Network"
            :resources="[
              { title: 'Upload', value: 583.96, unit: 'B/s' },
              { title: 'Download', value: 785.2, unit: 'B/s' },
            ]"
          >
            <Network :size="20" />
          </SystemCard>
        </div>
      </Block>
      <Block title="Website Monitoring" actionButtonTitle="Export/Import Options" showActionButton>
        <WebsiteCard
          v-for="(website, index) in websites"
          :key="website.id"
          :website="website"
          :index="index"
          :isExpanded="isWebsiteExpanded(website.id)"
          @move-card="moveWebsite"
          @toggle-expansion="toggleWebsiteExpansion"
        />
      </Block>
      <Block title="Resource Usage">
        <p>Welcome to the NodePuls Dashboard!</p>
      </Block>
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 2rem;
  align-items: start;
}

.system-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
</style>
