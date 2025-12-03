<template>
  <div class="box mb-4">
    <!-- Header row -->
    <div class="columns is-vcentered mb-2">
      <div class="column">
        <span class="has-text-weight-semibold">Source feed(s)</span>
      </div>
      <div class="column is-one-quarter">
        <span class="has-text-weight-semibold">Service date</span>
      </div>
      <div v-if="showTimeOfDay" class="column is-one-quarter">
        <span class="has-text-weight-semibold">Time-of-day</span>
      </div>
    </div>

    <!-- Feed version rows -->
    <div
      v-for="(fv, idx) of feedVersions"
      :key="idx"
      class="columns is-vcentered"
      :class="{ 'mb-2': idx < feedVersions.length - 1 }"
    >
      <!-- Feed version display -->
      <div class="column">
        <span>{{ fv.displayText }}</span>
        <a
          v-if="fv.feedOnestopId && fv.sha1"
          :href="`/feeds/${fv.feedOnestopId}/versions/${fv.sha1}`"
          target="_blank"
          class="ml-2"
          :title="fv.tooltip"
        >
          <t-icon icon="information-outline" size="small" />
        </a>
      </div>

      <!-- Service date input -->
      <div class="column is-one-quarter">
        <input
          :value="fv.serviceDate || ''"
          :disabled="disabled"
          class="input"
          type="date"
          :min="fv.startDate"
          :max="fv.endDate"
          @change="updateServiceDate(idx, ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- Time-of-day selector (only for first row) -->
      <div v-if="showTimeOfDay && idx === 0" class="column is-one-quarter">
        <div class="select is-fullwidth">
          <select
            :value="timeOfDay"
            :disabled="disabled"
            @change="updateTimeOfDay(($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="tod in timeOfDayOptions"
              :key="tod.value"
              :value="tod.value"
              :selected="tod.value === timeOfDay"
            >
              {{ tod.display }}
            </option>
          </select>
        </div>
      </div>
      <div v-else-if="showTimeOfDay" class="column is-one-quarter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import type { FeedVersionOption, SelectedFeedVersion } from './scenario'

interface TimeOfDayOption {
  value: string
  display: string
}

interface Props {
  selectedFeedVersions: SelectedFeedVersion[]
  feedVersionOptions: FeedVersionOption[]
  timeOfDay?: string
  showTimeOfDay?: boolean
  showAllDayOption?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  timeOfDay: 'all',
  showTimeOfDay: true,
  showAllDayOption: true,
  disabled: false
})

const emit = defineEmits<{
  'update:serviceDate': [idx: number, serviceDate: string]
  'update:timeOfDay': [value: string]
}>()

const timeOfDayOptions = computed((): TimeOfDayOption[] => {
  let tod: TimeOfDayOption[] = []
  if (props.showAllDayOption) {
    tod.push({ value: 'all', display: 'All day' })
  }
  tod = [...tod, ...[
    { value: '00:00-05:00', display: 'Owl: 12 - 5 a.m.' },
    { value: '05:00-07:00', display: 'Early morning rush 5 - 7 a.m.' },
    { value: '07:00-09:00', display: 'Morning rush: 7 - 9 a.m.' },
    { value: '09:00-14:00', display: 'Midday: 9 a.m. - 2 p.m.' },
    { value: '14:00-16:00', display: 'Early evening rush 2 - 4 p.m.' },
    { value: '16:00-19:00', display: 'Evening rush: 4 - 7 p.m.' },
    { value: '19:00-24:00', display: 'Night: 7 - 12 p.m.' }
  ]]
  return tod
})

const feedVersions = computed(() => {
  const fvMap = new Map<number, FeedVersionOption>()
  for (const fvo of props.feedVersionOptions) {
    fvMap.set(fvo.id, fvo)
  }

  return props.selectedFeedVersions.map((sfv) => {
    const fvo = fvMap.get(sfv.id)
    const displayName = fvo?.displayName || `Feed Version ${sfv.id}`

    // Extract feed name from displayName
    // Format is typically: "Feed Name: versionName (date)" or "Daily RG for date"
    let feedName = displayName
    const colonIndex = displayName.indexOf(':')
    if (colonIndex > 0) {
      feedName = displayName.substring(0, colonIndex).trim()
    }

    // Determine display text - if feed name and onestop ID are the same, only show one
    let displayText = feedName
    if (fvo?.feedOnestopId && feedName.toLowerCase() !== fvo.feedOnestopId.toLowerCase()) {
      displayText = `${feedName} (${fvo.feedOnestopId})`
    }

    // Build tooltip with feed version details
    const tooltipParts: string[] = []
    if (fvo?.sha1) {
      tooltipParts.push(`SHA1: ${fvo.sha1.substring(0, 8)}...`)
    }
    if (fvo?.fetchedAt) {
      tooltipParts.push(`Fetched: ${dayjs(fvo.fetchedAt).format('MMM D, YYYY')}`)
    }
    if (fvo?.start_date && fvo?.end_date) {
      tooltipParts.push(`Service: ${fvo.start_date} to ${fvo.end_date}`)
    }
    tooltipParts.push('Click to view feed version details')
    const tooltip = tooltipParts.join('\n')

    return {
      id: sfv.id,
      feedOnestopId: fvo?.feedOnestopId,
      displayName: displayName,
      feedName: feedName,
      displayText: displayText,
      sha1: fvo?.sha1 || null,
      tooltip: tooltip,
      serviceDate: sfv.serviceDate || fvo?.defaultServiceDate || null,
      startDate: fvo?.start_date,
      endDate: fvo?.end_date
    }
  })
})

function updateServiceDate (idx: number, newDate: string) {
  emit('update:serviceDate', idx, newDate)
}

function updateTimeOfDay (value: string | undefined) {
  if (value !== undefined) {
    emit('update:timeOfDay', value)
  }
}
</script>
