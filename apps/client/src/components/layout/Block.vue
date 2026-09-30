<script lang="ts" setup>
defineOptions({ name: 'LayoutBlock' })

const props = defineProps<{
  /** The URL to navigate to when the button is clicked */
  title?: string
}>()
</script>
<template>
  <div>
    <section class="block">
      <div v-if="props.title" className="section-title">
        <h2>{{ props.title }}</h2>
      </div>
      <slot />
    </section>
  </div>
</template>

<style scoped>
.block {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #3b82f6;
  margin-bottom: 1.5rem;
  flex-shrink: 0; /* Prevent header from shrinking */
}

.section-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #e2e8f0;
  padding-bottom: 0.5rem;
  flex: 1;
}
</style>
