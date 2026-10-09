<script setup lang="ts">
import WebsiteCard from '../components/elements/WebsiteCard.vue'
import Block from '../components/layout/Block.vue'
import SystemCard from '../components/elements/SystemCard.vue'
import { useWebsites } from '../composables/useWebsites'


defineOptions({ name: 'DashboardPage' })

const { websites, moveWebsite, toggleWebsiteExpansion, isWebsiteExpanded } = useWebsites()
</script>

<template>
  <section class="dashboard">
    <div class="dashboard-grid">
      <Block title="System Overview">
        <SystemCard
          title="CPU Usage"
          icon="CpuIcon"
          :resources="[
            { title: 'Cores', value: 4, unit: '' },
            { title: 'Threads', value: 8, unit: '' },
          ]"
          :mainValue="{ value: 65, unit: '%' }"
        />
        <SystemCard
          title="Memory Usage"
          icon="MemoryIcon"
          :resources="[
            { title: 'Total', value: 16, unit: 'GB' },
            { title: 'Used', value: 10, unit: 'GB' },
          ]"
          :mainValue="{ value: 62.5, unit: '%' }"
        />
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
</style>
