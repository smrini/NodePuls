<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    title: string
    resources: { title: string; value: number; unit: string }[]
    mainValue?: {
      value: number
      unit: string
    }
  }>(),
  {},
)

const getUsageColor = (usage: number) => {
  if (usage < 50) return 'good'
  if (usage < 80) return 'warning'
  return 'critical'
}
</script>

<template>
  <div class="stat-card">
    <div class="stat-header">
      <div>
        <slot></slot>
        <span>{{ props.title }}</span>
      </div>
    </div>
    <div class="stat-content">
      <div class="stat-usage-row">
        <div class="stat-usage-info">
          <div v-for="resource in props.resources" :key="resource.title" class="detail">
            <span>{{ resource.title }}: {{ resource.value }} {{ resource.unit }}</span>
          </div>
        </div>
      </div>
      <div class="progress-bar" v-if="props.mainValue">
        <div class="progress-fill" :class="getUsageColor(props.mainValue.value)" :style="{ width: props.mainValue.value + '%' }"></div>

      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.stat-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #475569;
  border-radius: 8px;
  padding: 1rem;
  transition:
    transform 0.2s,
    border-color 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #3b82f6;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
  font-weight: 500;
}

.stat-header > div:first-child {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-header:has(.stat-dropdown) > div:first-child span {
  position: relative;
}

.stat-dropdown {
  position: relative;
}

.detail {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 4px;
  background: #374151;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.progress-fill.good {
  background: #22c55e;
}
.progress-fill.warning {
  background: #f59e0b;
}
.progress-fill.critical {
  background: #ef4444;
}

/* System Stats Content Layout */
.stat-content {
	display: flex;
	flex-direction: column;
}

.stat-usage-row {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 1rem;
}

.stat-usage-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}


</style>
