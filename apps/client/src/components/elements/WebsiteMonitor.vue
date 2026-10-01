<script lang="ts" setup>
defineOptions({ name: 'WebsiteMonitor' })

import { GripVertical, ChevronUp, CircleDot } from '@lucide/vue'
</script>

<template>
  <div>
    <div class="website-card compact">
      <div class="card-header">
        <div class="drag-handle">
          <GripVertical :size="16" />
        </div>
        <div class="website-main-info">
          <div class="website-text">
            <div>
              <h4 class="website-name">Google</h4>
            </div>
            <p class="website-url">https://www.google.com</p>
          </div>
        </div>
        <div class="card-actions">
          <div class="status-indicator">
            <CircleDot :size="10" color="green" />
          </div>
          <button class="expand-btn">
            <ChevronUp :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Website Cards - Compact Design */
.website-card.compact {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #475569;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
}

.website-card.compact:hover {
  transform: translateY(-1px);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drag-handle {
  margin-right: 10px;
  cursor: grab;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.website-main-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.status-indicator {
  flex-shrink: 0;
}

.website-text {
  flex: 1;
  min-width: 0;
}

.website-name {
  font-weight: 500;
  color: #e2e8f0;
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.website-url {
  color: #94a3b8;
  font-size: 0.8rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-btn:hover {
  color: #d1d5db;
  background: rgba(107, 114, 128, 0.1);
}
</style>
