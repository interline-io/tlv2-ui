<template>
  <div class="search-options mb-2">
    <o-field v-if="showDateSelector" horizontal label="Date">
      <o-datetimepicker
        :model-value="startDate"
        horizontal-time-picker
        placeholder="Now"
        icon="calendar-today"
        trap-focus
        size="small"
        @update:model-value="$emit('update:startDate', $event)"
      />
    </o-field>

    <o-field v-if="showRadiusSelector" horizontal label="Search radius">
      <o-select
        :model-value="radius"
        size="small"
        @update:model-value="$emit('update:radius', $event)"
      >
        <option v-for="r of allowedRadius" :key="r" :value="r">
          {{ r }}m
        </option>
      </o-select>
    </o-field>

    <o-field horizontal label="Options">
      <o-checkbox
        v-if="showAutoRefresh"
        :model-value="autoRefresh"
        size="small"
        @update:model-value="$emit('update:autoRefresh', $event)"
      >
        Auto-refresh
      </o-checkbox>
      <o-checkbox
        v-if="showFallbackSelector"
        :model-value="useServiceWindow"
        size="small"
        @update:model-value="$emit('update:useServiceWindow', $event)"
      >
        Fallback service day
      </o-checkbox>
    </o-field>

    <div v-if="lastFetched && showLastFetched" :key="lastFetchedDisplayKey" class="tags has-addons">
      <span class="tag is-small">Last checked</span>
      <span class="tag is-success is-small">{{ fromNowDate(lastFetched) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fromNowDate } from '../lib/filters'

// Props
defineProps<{
  startDate?: Date | null
  radius: number
  autoRefresh: boolean
  useServiceWindow: boolean
  lastFetched?: Date | null
  lastFetchedDisplayKey?: number
  showDateSelector?: boolean
  showRadiusSelector?: boolean
  showFallbackSelector?: boolean
  showAutoRefresh?: boolean
  showLastFetched?: boolean
  allowedRadius?: number[]
}>()

// Emits
defineEmits<{
  'update:startDate': [value: Date | null]
  'update:radius': [value: number]
  'update:autoRefresh': [value: boolean]
  'update:useServiceWindow': [value: boolean]
}>()
</script>
