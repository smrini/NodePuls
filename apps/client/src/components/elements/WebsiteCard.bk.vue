<script setup>
import { ref, h } from 'vue'
import {
  ExternalLink,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  BarChart3,
  GripVertical,
  Edit,
  Trash2,
} from 'lucide-vue-next'

const props = defineProps({
  website: { type: Object, required: true },
  index: { type: Number, required: true },
  isExpanded: { type: Boolean, default: false },
})

const emit = defineEmits(['move-card', 'toggle-expansion', 'open-analytics', 'remove', 'edit'])

const isDragging = ref(false)

const onDragStart = (e) => {
  isDragging.value = true
  e.dataTransfer.setData('text/plain', props.index)
  e.dataTransfer.effectAllowed = 'move'
}

const onDragEnd = () => {
  isDragging.value = false
}

const onDrop = (e) => {
  e.preventDefault()
  const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
  if (dragIndex !== props.index) {
    emit('move-card', dragIndex, props.index)
  }
}

const handleWebsiteClick = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const handleCardClick = (e) => {
  if (
    e.target.closest('button') ||
    e.target.closest('.card-actions') ||
    e.target.closest('.drag-handle')
  ) {
    return
  }
  handleWebsiteClick(props.website.url)
}

const getStatusIcon = (status) => {
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

const formatResponseTime = (time) => (time ? `${time}ms` : 'N/A')

const formatUrl = (url) => {
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

const formatUpSince = (upSince) => {
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
      <div
        class="drag-handle"
        style="
          margin-right: 10px;
          cursor: grab;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        "
        @click.stop
      >
        <GripVertical
          :size="16"
          :style="{
            color: isDragging ? '#0066cc' : '#666',
            transition: 'color 0.2s ease',
          }"
        />
      </div>

      <div class="website-main-info" @click="handleCardClick">
        <div class="website-text">
          <div style="display: flex; align-items: center; gap: 5px">
            <h4 class="website-name">{{ website.name }}</h4>
          </div>
          <p class="website-url">{{ formatUrl(website.url) }}</p>
        </div>
      </div>

      <div class="card-actions">
        <div class="status-indicator" style="margin-bottom: 3px">
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
            {{ website.status === 'up' ? formatUpSince(website.upSince) : 'Currently down' }}
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
