<script lang="ts" setup>

import { Wifi, WifiOff, Activity } from '@lucide/vue';

const props = withDefaults(
  defineProps<{
      /** Connection Status - ( false ) */
    connected?: boolean
  }>(),
  { connected: false },
)

</script>

<template>
  <div class="connection-status" :class="props.connected ? 'connected' : 'disconnected'">
    <Wifi v-if="props.connected" :size="16" />
    <WifiOff v-else :size="16" />
    {{ props.connected ? 'Connected' : 'Disconnected' }}
    <Activity :class="`pulse ${props.connected ? 'active' : ''}`" :size="12" />
  </div>

</template>

<style scoped>
.connection-status {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	border-radius: 6px;
	font-size: 0.875rem;
	font-weight: 500;
}

.connection-status.connected {
	background: rgba(34, 197, 94, 0.1);
	color: #22c55e;
	border: 1px solid rgba(34, 197, 94, 0.2);
}

.connection-status.disconnected {
	background: rgba(239, 68, 68, 0.1);
	color: #ef4444;
	border: 1px solid rgba(239, 68, 68, 0.2);
}


</style>