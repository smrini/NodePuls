<script lang="ts" setup>
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Clock,
  Circle,
  Edit,
  ExternalLink,
  GripVertical,
  Trash2,
} from '@lucide/vue'
import { ref, h } from 'vue'
import type { Website } from '@nodepuls/shared-types'

defineOptions({ name: 'WebsiteMonitor' })

const props = withDefaults(
  defineProps<{
    website: Website
    index: number
    isExpanded: boolean
  }>(),
  { isExpanded: false },
)

const emit = defineEmits<{
  'move-card': [fromIndex: number, toIndex: number]
  'toggle-expansion': [websiteId: string]
  'open-analytics': [website: Website]
  remove: [websiteId: string]
  edit: [website: Website]
}>()

const handleWebsiteClick = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const handleCardClick = (event: MouseEvent) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) return

  if (
    target.closest('button') ||
    target.closest('.card-actions') ||
    target.closest('.drag-handle')
  ) {
    return
  }
  handleWebsiteClick(props.website.url)
}

const getStatusIcon = (status: Website['status']) => {
  switch (status) {
    case 'up':
      return h(Circle, { size: 12, class: 'status-icon up', fill: 'currentColor' })
    case 'down':
      return h(Circle, { size: 12, class: 'status-icon down', fill: 'currentColor' })
    case 'checking':
      return h(Circle, { size: 12, class: 'status-icon checking' })
    default:
      return h(Circle, { size: 12, class: 'status-icon unknown' })
  }
}

const formatResponseTime = (time: number | null) => (time === null ? 'N/A' : `${time}ms`)

const formatUrl = (url: string) => {
  try {
    const urlObj = new URL(url)
    const isDefaultPort =
      (urlObj.protocol === 'http:' && urlObj.port === '80') ||
      (urlObj.protocol === 'https:' && urlObj.port === '443') ||
      urlObj.port === ''
    return isDefaultPort ? urlObj.hostname : `${urlObj.hostname}:${urlObj.port}`
  } catch {
    return url
  }
}

const isDragging = ref(false)

const onDragStart = (event: DragEvent) => {
  isDragging.value = true
  if (!event.dataTransfer) return

  event.dataTransfer.setData('text/plain', String(props.index))
  event.dataTransfer.effectAllowed = 'move'
}

const onDragEnd = () => {
  isDragging.value = false
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  if (!event.dataTransfer) return

  const dragIndex = Number.parseInt(event.dataTransfer.getData('text/plain'), 10)
  if (dragIndex !== props.index) {
    emit('move-card', dragIndex, props.index)
  }
}

const formatUpSince = (upSince: string | null) => {
  if (!upSince) return 'Unknown'
  const diffMs = Date.now() - new Date(upSince).getTime()

  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000))
    return hours === 0 ? 'Less than an hour' : `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  if (diffMs < 30 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
    return `${days} day${days !== 1 ? 's' : ''}`
  }
  const months = Math.floor(diffMs / (30 * 24 * 60 * 60 * 1000))
  return `${months} month${months !== 1 ? 's' : ''}`
}
</script>

<template>
  <div
    class="website-card compact"
    :class="{ 'is-dragging': isDragging }"
    :style="{
      opacity: isDragging ? 0.3 : 1,
      transform: isDragging ? 'rotate(5deg)' : 'none',
      transition: isDragging ? 'none' : 'all 0.2s ease',
    }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover.prevent
    @dragenter.prevent
    @drop="onDrop"
  >
    <!-- Compact Card Header -->
    <div class="card-header">
      <div class="drag-handle" @click.stop>
        <GripVertical
          :size="16"
          :style="{
            color: isDragging ? '#0066cc' : '#666',
            transition: 'color 0.2s ease',
          }"
        />
      </div>

      <button class="website-main-info" type="button" @click="handleCardClick">
        <div class="website-text">
          <div class="website-title-row">
            <h4 class="website-name">{{ props.website.name }}</h4>
          </div>
          <p class="website-url">{{ formatUrl(website.url) }}</p>
        </div>
      </button>

      <div class="card-actions">
        <div class="status-indicator">
          <component :is="getStatusIcon(website.status)" />
        </div>
        <button
          class="expand-btn"
          @click="$emit('toggle-expansion', website.id)"
          :title="isExpanded ? 'Show less' : 'Show details'"
        >
          <ChevronUp v-if="isExpanded" :size="16" />
          <ChevronDown v-else :size="16" />
        </button>
      </div>
    </div>
    <!-- Expanded Details -->
    <div v-if="isExpanded" class="card-details">
      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">Status</span>
          <span :class="['detail-value', 'status', website.status]">
            {{ website.status.toUpperCase() }}
          </span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Response Time</span>
          <span class="detail-value">
            {{ formatResponseTime(website.responseTime) }}
          </span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Up Since</span>
          <span class="detail-value">
            <Clock :size="12" />
            {{
              website.status === 'up' ? formatUpSince(website.upSince || null) : 'Currently down'
            }}
          </span>
        </div>

        <div class="detail-item">
          <span class="detail-label">URL</span>
          <span class="detail-value url-text">{{ website.url }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button
          class="action-btn primary"
          @click="handleWebsiteClick(website.url)"
          title="Visit website"
        >
          <ExternalLink :size="14" />
          Visit Site
        </button>

        <button
          class="action-btn secondary"
          @click="$emit('open-analytics', website)"
          title="View analytics"
        >
          <BarChart3 :size="14" />
          Analytics
        </button>

        <div>
          <button class="action-btn secondary" @click="$emit('edit', website)" title="Edit website">
            <Edit :size="14" />
          </button>

          <button
            class="action-btn danger"
            @click="$emit('remove', website.id)"
            title="Remove website"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.website-card.compact {
  display: flex;
  flex-direction: column;
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

.website-card.compact.is-dragging {
  cursor: grabbing;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
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
  flex-shrink: 0;
}

.website-main-info {
  appearance: none;
  background: none;
  border: 0;
  padding: 0;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  text-align: left;
}

.website-main-info:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 3px;
  border-radius: 6px;
}

.status-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.website-text {
  flex: 1;
  min-width: 0;
}

.website-title-row {
  display: flex;
  align-items: center;
  gap: 5px;
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
  flex-shrink: 0;
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

.card-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #374151;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1.85fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-value {
  color: #e2e8f0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.detail-value.url-text {
  word-break: break-all;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: #94a3b8;
}

.detail-value .status {
  font-weight: 500;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.detail-value .status.up {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.detail-value .status.down {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.detail-value .status.checking {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-buttons div {
  display: flex;
  gap: 7px;
  height: 35px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 0;
  justify-content: center;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: #374151;
  color: #d1d5db;
}

.action-btn.secondary:hover {
  background: #4b5563;
}

.action-btn.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.2);
}

.status-icon {
  flex-shrink: 0;
}

.status-icon.up {
  color: #22c55e;
}

.status-icon.down {
  color: #ef4444;
}

.status-icon.checking {
  color: #f59e0b;
  animation: pulse 2s infinite;
}

.status-icon.unknown {
  color: #6b7280;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
