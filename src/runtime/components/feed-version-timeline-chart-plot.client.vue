<template>
  <div>
    <div v-if="loading" class="has-text-centered">
      <tl-loading />
    </div>
    <div v-else-if="error" class="has-text-centered">
      <tl-msg-error>{{ error }}</tl-msg-error>
    </div>
    <div v-else-if="feedVersions.length === 0" class="has-text-centered">
      <tl-msg-info>No feed versions available to display.</tl-msg-info>
    </div>
    <div v-else>
      <div ref="chartContainer" class="chart-container" />

      <!-- Custom legend with both color status and fallback week dots -->
      <div class="legend-container">
        <div class="legend-row">
          <div class="legend-item">
            <div class="legend-color" style="background-color: #f7ae56;" />
            <span class="legend-label">Imported into API & Marked as Active</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #60C6D5;" />
            <span class="legend-label">Imported into API</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #7a7a7a;" />
            <span class="legend-label">Archived</span>
          </div>
        </div>
        <div class="legend-row">
          <div class="legend-item">
            <div class="legend-line" style="background-color: gray; height: 4px;" />
            <span class="legend-label">Scheduled service available (line)</span>
          </div>
          <div class="legend-item">
            <div class="legend-bar" style="background-color: gray; opacity: 0.6;" />
            <span class="legend-label">Specified service range (filled box)</span>
          </div>
          <div class="legend-item">
            <div class="legend-bar-no-fill" />
            <span class="legend-label">Representative fallback service week (box without fill)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import * as Plot from '@observablehq/plot'

interface ServiceWindow {
  feed_start_date?: string
  feed_end_date?: string
  earliest_calendar_date?: string
  latest_calendar_date?: string
  fallback_week?: boolean
}

interface FeedVersionGtfsImport {
  success?: boolean
}

interface FeedState {
  feed_version?: {
    id: number
  }
}

interface FeedVersion {
  id: number
  sha1: string
  name?: string
  fetched_at?: string
  service_window?: ServiceWindow
  feed_version_gtfs_import?: FeedVersionGtfsImport
}

interface Feed {
  feed_state?: FeedState
}

type StatusType = typeof STATUS_TYPES[keyof typeof STATUS_TYPES]

interface ChartDataItem {
  y: string
  name: string
  sha1: string
  status: StatusType
  feedStart: Date | null
  feedEnd: Date | null
  earliestService: Date | null
  latestService: Date | null
  fallbackWeek: Date | null
  fetched_at: Date | null
  feed_start_date?: string
  feed_end_date?: string
  earliest_calendar_date?: string
  latest_calendar_date?: string
  fallback_week?: string
}

const props = withDefaults(defineProps<{
  feed: Feed
  feedVersions: FeedVersion[]
  height?: string
  showTooltip?: boolean
}>(), {
  height: '300px',
  showTooltip: true
})

const emit = defineEmits<{
  feedVersionClick: [feedVersion: ChartDataItem]
}>()

// Template refs
const chartContainer = ref<HTMLElement | null>(null)

// Reactive data
const loading = ref(false)
const error = ref<string | null>(null)
const plot = ref<any>(null)
const resizeObserver = ref<ResizeObserver | null>(null)

// Status constants to avoid magic strings
const STATUS_TYPES = {
  IMPORTED_AND_ACTIVE: 'Imported into API & Marked as Active',
  IMPORTED: 'Imported into API',
  NOT_IMPORTED: 'Archived'
} as const

// Color mapping for status types - using Transitland brand colors
const _STATUS_COLORS = {
  [STATUS_TYPES.IMPORTED_AND_ACTIVE]: '#f7ae56', // Orange - most prominent
  [STATUS_TYPES.IMPORTED]: '#60C6D5', // Blue - second level prominence
  [STATUS_TYPES.NOT_IMPORTED]: '#7a7a7a' // Bulma gray for archived/neutral
} as const

const containerWidth = computed(() => {
  if (chartContainer.value) {
    return chartContainer.value.clientWidth
  }
  return 800 // fallback width
})

// Dynamic height calculation based on number of feed versions
const chartHeight = computed(() => {
  if (!props.feedVersions.length) return 300

  // Base height for margins, labels, and axis spacing
  const baseHeight = 160 // Increased to account for X-axis labels and margins
  // Height per row (feed version) - adjust this value for more/less spacing
  const heightPerRow = 20 // Reduced from 25 to prevent overflow issues

  // Cap the maximum height to prevent rendering issues
  return Math.min(800, Math.max(300, baseHeight + (props.feedVersions.length * heightPerRow)))
})

const chartData = computed((): ChartDataItem[] => {
  if (!props.feedVersions.length) return []

  // Transform data for the chart
  const chartData = props.feedVersions.map((fv): ChartDataItem => {
    // Determine status for coloring based on import and active status
    // Use the same logic as the table: feed_version_gtfs_import for imported, feed_state for active
    const isImported = fv.feed_version_gtfs_import && fv.feed_version_gtfs_import.success === true
    const isActive = props.feed.feed_state && props.feed.feed_state.feed_version && props.feed.feed_state.feed_version.id === fv.id

    let status: StatusType = STATUS_TYPES.NOT_IMPORTED
    if (isImported && isActive) {
      status = STATUS_TYPES.IMPORTED_AND_ACTIVE
    } else if (isImported && !isActive) {
      status = STATUS_TYPES.IMPORTED
    }

    // Parse dates
    const feedStart = fv.service_window?.feed_start_date ? new Date(fv.service_window.feed_start_date) : null
    const feedEnd = fv.service_window?.feed_end_date ? new Date(fv.service_window.feed_end_date) : null
    const earliestService = fv.service_window?.earliest_calendar_date ? new Date(fv.service_window.earliest_calendar_date) : null
    const latestService = fv.service_window?.latest_calendar_date ? new Date(fv.service_window.latest_calendar_date) : null
    const fallbackWeek = fv.service_window?.fallback_week ? new Date(fv.service_window.fallback_week) : null

    return {
      y: fv.sha1.substr(0, 6),
      name: fv.name || 'Unknown',
      sha1: fv.sha1,
      status,
      // Box and whisker data
      feedStart,
      feedEnd,
      earliestService,
      latestService,
      fallbackWeek,
      // For tooltip and sorting
      fetched_at: fv.fetched_at ? new Date(fv.fetched_at) : null,
      feed_start_date: fv.service_window?.feed_start_date,
      feed_end_date: fv.service_window?.feed_end_date,
      earliest_calendar_date: fv.service_window?.earliest_calendar_date,
      latest_calendar_date: fv.service_window?.latest_calendar_date,
      fallback_week: fv.service_window?.fallback_week
    }
  })

  return chartData
})

// Watch for chartData changes
watch(chartData, () => {
  nextTick(() => {
    updatePlot()
  })
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
  nextTick(() => {
    initPlot()

    // Add ResizeObserver for better width handling
    if (chartContainer.value) {
      resizeObserver.value = new ResizeObserver(() => {
        updatePlot()
      })
      resizeObserver.value.observe(chartContainer.value as unknown as Element)
    }
  })
})

onBeforeUnmount(() => {
  if (plot.value) {
    plot.value.remove()
  }
  window.removeEventListener('resize', handleResize)
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})

// Methods
const getPlotOptions = () => {
  if (!chartData.value.length) return {}

  // Sort data by fetched_at date (newest first) to match table order
  const sortedData = [...chartData.value].sort((a, b) => {
    if (!a.fetched_at || !b.fetched_at) return 0
    return b.fetched_at.getTime() - a.fetched_at.getTime()
  })

  // Extract y domain for explicit ordering
  const yDomain = sortedData.map(d => d.y)

  const data = sortedData

  return {
    width: containerWidth.value,
    height: chartHeight.value, // Use dynamic height
    margin: 80, // Use standard margin that Plot handles well
    x: {
      type: 'time' as const,
      label: 'Service Period',
      labelOffset: 35
    },
    y: {
      label: 'Feed Versions',
      labelOffset: 60,
      domain: yDomain, // Set explicit domain order
      tickSize: 0 // Remove tick marks for cleaner look
    },
    color: {
      domain: [STATUS_TYPES.IMPORTED_AND_ACTIVE, STATUS_TYPES.IMPORTED, STATUS_TYPES.NOT_IMPORTED],
      range: ['#f7ae56', '#60C6D5', '#7a7a7a'],
      legend: false
    },
    marks: [
      // Lines for service period (broader service availability range)
      Plot.ruleY(data.filter(d => d.earliestService && d.latestService), {
        y: 'y',
        x1: 'earliestService',
        x2: 'latestService',
        stroke: 'status',
        strokeWidth: 4,
        strokeOpacity: 0.8
      }),
      // Rectangles for feed info range (conservative GTFS coverage dates)
      Plot.rect(data.filter(d => d.feedStart && d.feedEnd), {
        y: 'y',
        x1: 'feedStart',
        x2: 'feedEnd',
        fill: 'status',
        fillOpacity: 0.6
      }),
      // Rectangles for fallback service week (full week span)
      Plot.rect(data.filter(d => d.fallbackWeek).map((d) => {
        const sunday = new Date(d.fallbackWeek!)
        const saturday = new Date(sunday)
        saturday.setDate(sunday.getDate() + 6)
        return {
          ...d,
          fallbackWeekStart: sunday,
          fallbackWeekEnd: saturday
        }
      }), {
        y: 'y',
        x1: 'fallbackWeekStart',
        x2: 'fallbackWeekEnd',
        fill: 'none',
        stroke: 'status',
        strokeWidth: 1
      }),
      // Tip for fallback week with detailed explanation
      Plot.tip(data.filter(d => d.fallbackWeek).map((d) => {
        const sunday = new Date(d.fallbackWeek!)
        const saturday = new Date(sunday)
        saturday.setDate(sunday.getDate() + 6)
        return {
          ...d,
          fallbackWeekStart: sunday,
          fallbackWeekEnd: saturday
        }
      }), Plot.pointer({
        x: d => (d.fallbackWeekStart.getTime() + d.fallbackWeekEnd.getTime()) / 2, // Center of the week
        y: 'y',
        title: d => `Representative fallback service week: ${d.fallback_week} to ${d.fallbackWeekEnd.toISOString().split('T')[0]}`,
        anchor: 'bottom',
        pointerSize: 8
      })),
      // Dots for feed versions with only fetched_at dates
      Plot.dot(data.filter(d => !d.feedStart && !d.earliestService && d.fetched_at), {
        y: 'y',
        x: 'fetched_at',
        fill: 'status',
        stroke: 'black',
        strokeWidth: 1,
        r: 4
      }),
      // Add tip mark for rich tooltips
      Plot.tip(data, Plot.pointer({
        x: (d) => {
          // Use the center of the service period if available, otherwise feed period
          if (d.earliestService && d.latestService) {
            return (d.earliestService.getTime() + d.latestService.getTime()) / 2
          } else if (d.feedStart && d.feedEnd) {
            return (d.feedStart.getTime() + d.feedEnd.getTime()) / 2
          }
          return d.fallbackWeek ? d.fallbackWeek.getTime() : (d.fetched_at ? d.fetched_at.getTime() : 0)
        },
        y: 'y',
        channels: {
          'Feed Version': 'name',
          'SHA1': 'sha1',
          'Status': 'status',
          'Feed Info Range': d => d.feed_start_date && d.feed_end_date ? `${d.feed_start_date} to ${d.feed_end_date}` : 'N/A',
          'Full Service Range': d => d.earliest_calendar_date && d.latest_calendar_date ? `${d.earliest_calendar_date} to ${d.latest_calendar_date}` : 'N/A',
          'Fallback Week': d => d.fallback_week || 'N/A'
        },
        format: {
          'Feed Version': true,
          'SHA1': true,
          'Status': true,
          'Feed Info Range': true,
          'Full Service Range': true,
          'Fallback Week': true
        },
        anchor: 'bottom',
        pointerSize: 8,
        textPadding: 6,
        fontSize: 11,
        lineWidth: 25
      }))
    ]
  }
}

const initPlot = () => {
  if (!chartContainer.value || !chartData.value.length) return

  try {
    plot.value = Plot.plot(getPlotOptions())
    chartContainer.value.append(plot.value)

    // Handle click events
    plot.value.addEventListener('click', (event: Event) => {
      const target = event.target as any
      if (target && target.dataset && target.dataset.sha1) {
        const feedVersion = chartData.value.find(item => item.sha1 === target.dataset.sha1)
        if (feedVersion) {
          emit('feedVersionClick', feedVersion)
        }
      }
    })

    // Handle window resize
    window.addEventListener('resize', handleResize)
  } catch (err: any) {
    error.value = `Failed to create plot: ${err.message}`
    console.error('Plot error:', err)
  }
}

const updatePlot = () => {
  if (plot.value) {
    plot.value.remove()
    initPlot()
  }
}

const handleResize = () => {
  if (plot.value) {
    updatePlot()
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: v-bind(chartHeight + 'px');
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

/* Custom legend styles */
.legend-container {
  padding: 8px 10px;
  background-color: #f9f9f9;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  margin-top: 2px; /* Reduced from 10px to bring closer to chart */
  margin-left: 1px; /* Align with chart border */
  margin-right: 1px; /* Align with chart border */
}

.legend-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 15px; /* Space between legend items */
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px; /* Space between color/dot and label */
}

.legend-color {
  width: 15px;
  height: 15px;
  border-radius: 3px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #000; /* Black for fallback week dots */
}

.legend-label {
  font-size: 0.9em;
  color: #333;
}

/* New styles for chart element explanations */
.chart-elements {
  margin-top: 10px; /* Space between color status and chart element explanations */
  padding-top: 10px;
  border-top: 1px dashed #ccc; /* Separator line */
}

.legend-bar {
  width: 20px;
  height: 15px;
  border-radius: 2px;
  margin-right: 5px;
}

.legend-bar-no-fill {
  width: 10px;
  height: 15px;
  border-radius: 2px;
  margin-right: 5px;
  border: 2px solid gray;
  background: transparent;
}

.legend-line {
  width: 20px;
  height: 1px;
  background-color: #000; /* Black for service period lines */
  margin-right: 5px;
}

/* SVG status styling using CSS variables */
.chart-container :deep(.status-imported-into-api-marked-as-active) {
  fill: var(--logo-color-1) !important;
  stroke: var(--logo-color-1) !important;
}

.chart-container :deep(.status-imported-into-api) {
  fill: var(--logo-color-3) !important;
  stroke: var(--logo-color-3) !important;
}

.chart-container :deep(.status-archived) {
  fill: var(--bulma-grey) !important;
  stroke: var(--bulma-grey) !important;
}
</style>
