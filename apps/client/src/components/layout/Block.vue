<script lang="ts" setup>
import { MoreVertical } from '@lucide/vue'

defineOptions({ name: 'LayoutBlock' })

const props = withDefaults(
  defineProps<{
    /** The title of the block */
    title?: string
    /** Whether to show the action button */
    showActionButton?: boolean
    /** The title of the action button */
    actionButtonTitle?: string
  }>(),
  {
    showActionButton: false,
  },
)
</script>
<template>
  <div>
    <section class="block">
      <div v-if="props.title" class="section-title">
        <h2>{{ props.title }}</h2>

        <div v-if="props.showActionButton" class="section-actions">
          <button class="ActionButton" :about="props.actionButtonTitle">
            <MoreVertical :size="16" />
          </button>
        </div>
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

.section-actions {
  display: flex;
  align-items: center;
  margin-left: 1rem;
  margin-bottom: 0.5rem; /* Align with h2 baseline */
}

.ActionButton {
  background: rgba(51, 65, 85, 0.6);
  border: 1px solid #475569;
  border-radius: 4px;
  color: #cbd5e1;
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.ActionButton:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #3b82f6;
}

.ActionButton:focus {
  outline: none;
  box-shadow: none;
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #3b82f6;
}
</style>
