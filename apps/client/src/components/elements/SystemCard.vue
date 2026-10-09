<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    title: string
    icon: string
    resources: { title: string; value: number; unit: string }[]
    mainValue: {
      value: number
      unit: string
    }
  }>(),
  {},
)
</script>

<template>
  <div className="stat-card">
    <div className="stat-header">
      <div>
        <component :is="props.icon" :size="20" />
        <span>{{ props.title }}</span>
      </div>
    </div>
    <div className="stat-content">
      <div className="stat-usage-row">
        <div className="stat-usage-info">
          <div v-for="resource in props.resources" :key="resource.title" className="detail">
            <span>{{ resource.title }}: {{ resource.value }} {{ resource.unit }}</span>
          </div>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress" :style="{ width: props.mainValue.value + '%' }"></div>
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

.stat-dropdown {
  position: relative;
}
</style>
