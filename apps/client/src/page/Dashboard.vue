<script setup lang="ts">
defineOptions({ name: 'DashboardPage' })

import WebsiteMonitor from '../components/elements/WebsiteMonitor.vue'
import Block from '../components/layout/Block.vue'
</script>

<template>
  <section class="dashboard">
    <div class="dashboard-grid">
      <Block title="System Overview">
        <p>Welcome to the NodePuls Dashboard!</p>
      </Block>
      <Block title="Website Monitoring" actionButtonTitle="Export/Import Options" showActionButton>
        <p>Welcome to the NodePuls Dashboard!</p>
        <WebsiteMonitor />
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
