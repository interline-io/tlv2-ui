<template>
  <div>
    <div class="columns">
      <div class="column">
        <label class="label">Feed version(s)</label>
      </div>
      <div class="column is-one-quarter">
        <label class="label">Service date(s)</label>
      </div>
      <div
        v-if="showTimeOfDay"
        class="column is-one-quarter"
      >
        <label class="label">Time-of-day</label>
      </div>
    </div>

    <div
      v-for="(item, idx) of internalValue"
      :key="idx"
      class="columns is-mobile"
      :class="{ 'mb-2': idx < internalValue.length - 1 }"
    >
      <div class="column">
        <div class="field has-addons mb-0">
          <div class="control is-expanded">
            <div class="select is-fullwidth">
              <select
                :value="item.id"
                :disabled="disabled"
                @change="updateFeedVersionId(idx, parseInt(($event.target as HTMLSelectElement).value))"
              >
                <optgroup
                  v-for="(fvGroup, fvGroupKey) of feedVersionOptionGroups"
                  :key="fvGroupKey"
                  :label="fvGroup.name"
                >
                  <option
                    v-for="fvOpt of fvGroup.feedVersions"
                    :key="fvOpt.id"
                    :value="fvOpt.id"
                    :selected="fvOpt.id === item.id"
                  >
                    {{ fvOpt.displayName || fvOpt.id }}
                  </option>
                </optgroup>
              </select>
            </div>
          </div>
          <div
            v-if="idx > 0 && allowMultiple"
            class="control"
          >
            <button
              class="button is-danger"
              title="Remove this feed version from selection"
              @click="removeFeedVersion(idx)"
            >
              <o-icon
                icon="delete"
                size="small"
              />
            </button>
          </div>
        </div>
        <slot :name="`warning-${idx}`" :item="item" :index="idx">
          <!-- Warning messages can be inserted here via slot -->
        </slot>
      </div>

      <div class="column is-one-quarter" style="align-self: flex-start;">
        <div class="control">
          <input
            :value="item.serviceDate"
            :disabled="disabled"
            class="input"
            title="Set a date used to query schedules within the given feed version"
            type="date"
            :min="getFeedVersionOption(item.id)?.start_date"
            :max="getFeedVersionOption(item.id)?.end_date"
            required
            @change="updateServiceDate(idx, ($event.target as HTMLInputElement).value)"
          >
        </div>
      </div>

      <div
        v-if="showTimeOfDay && idx === 0"
        class="column is-one-quarter"
        style="align-self: flex-start;"
      >
        <div class="field">
          <div class="control">
            <div class="select is-fullwidth">
              <select
                :value="timeOfDay"
                :disabled="disabled"
                required
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
        </div>
      </div>
      <div
        v-else-if="showTimeOfDay"
        class="column is-one-quarter"
      />
    </div>

    <div class="columns">
      <div class="column">
        <nuxt-link
          v-if="showUploadLink"
          :to="{ name: 'feeds' }"
          target="_blank"
          class="button is-primary is-outlined"
        >
          <o-icon icon="upload" /> <span>Upload a new user feed</span>
        </nuxt-link>
        <span class="is-pulled-right">
          <a
            v-if="allowMultiple"
            class="button is-primary"
            title="Add a feed version to selection"
            @click="addFeedVersion"
          ><o-icon
            icon="plus"
          /></a>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export interface FeedVersionSelection {
  id: number
  serviceDate: string
  startTime?: string
  endTime?: string
}

export interface FeedVersionOptionInput {
  id: number
  displayName?: string
  feedOnestopId?: string
  fetchedAt: string
  defaultServiceDate?: string | null
  start_date?: string
  end_date?: string
}

interface TimeOfDayOption {
  value: string
  display: string
}

interface FeedVersionGroup {
  name: string
  feedVersions: FeedVersionOptionInput[]
}

interface Props {
  modelValue?: FeedVersionSelection[]
  feedVersionOptions?: FeedVersionOptionInput[]
  disabled?: boolean
  showTimeOfDay?: boolean
  showAllDayOption?: boolean
  allowMultiple?: boolean
  showUploadLink?: boolean
  timeOfDay?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  feedVersionOptions: () => [],
  disabled: false,
  showTimeOfDay: true,
  showAllDayOption: true,
  allowMultiple: true,
  showUploadLink: true,
  timeOfDay: '07:00-09:00'
})

const emit = defineEmits<{
  'update:modelValue': [value: FeedVersionSelection[]]
  'update:timeOfDay': [value: string]
}>()

const internalValue = ref<FeedVersionSelection[]>([])

// Initialize internal value from modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.length > 0) {
    internalValue.value = newValue.map(v => ({ ...v }))
  } else {
    // Initialize with one empty entry if none provided
    const firstOption = props.feedVersionOptions[0]
    internalValue.value = [{
      id: firstOption?.id || 0,
      serviceDate: firstOption?.defaultServiceDate || (new Date().toISOString().split('T')[0] ?? '')
    }]
  }
}, { immediate: true, deep: true })

// Watch for options to populate if we are currently showing a placeholder
watch(() => props.feedVersionOptions, (newOptions) => {
  if (newOptions.length > 0 && internalValue.value.length === 1 && internalValue.value[0]?.id === 0) {
    // If we have a placeholder (id=0) and now we have options, try to pick a better default
    // BUT only if modelValue is empty. If modelValue has a value, we should respect it.
    if (!props.modelValue || props.modelValue.length === 0) {
      const firstOption = newOptions[0]
      if (firstOption) {
        const newVal = [{
          id: firstOption.id,
          serviceDate: firstOption.defaultServiceDate || (new Date().toISOString().split('T')[0] ?? '')
        }]
        internalValue.value = newVal
        emit('update:modelValue', newVal)
      }
    }
  }
})

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

const feedVersionOptionGroups = computed((): Record<string, FeedVersionGroup> => {
  const g: Record<string, FeedVersionGroup> = {
    RG: { name: 'Daily RG', feedVersions: [] },
    historic: { name: 'Monthly RG', feedVersions: [] },
    shared: { name: 'Shared feed versions', feedVersions: [] }
  }

  for (const fvo of props.feedVersionOptions) {
    const feedKey = fvo.feedOnestopId || 'shared'
    g[feedKey] = g[feedKey] || { name: (fvo.feedOnestopId || ''), feedVersions: [] }
    g[feedKey]!.feedVersions.push(fvo)
  }

  // Only show current monthly RG
  let mostRecentMonthly = '2000-01'
  if (g.historic?.feedVersions && g.historic.feedVersions.length > 0) {
    mostRecentMonthly = g.historic.feedVersions[0]!.fetchedAt.substr(0, 7)
  }
  const currentMonthRegional = g.RG?.feedVersions?.filter((fv) => { return fv.fetchedAt.substr(0, 7) > mostRecentMonthly }) || []
  const previousMonthRegional = g.RG?.feedVersions?.filter((fv) => { return fv.fetchedAt.substr(0, 7) === mostRecentMonthly }) || []
  if (currentMonthRegional.length > 0 && g.RG) {
    g.RG.feedVersions = currentMonthRegional
  } else if (previousMonthRegional.length > 0 && g.RG) {
    g.RG.feedVersions = previousMonthRegional
  }

  // Limit the number of feeds displayed per group
  for (const k of Object.keys(g)) {
    if (k.length === 2 && k !== 'RG' && g[k]) {
      g[k]!.feedVersions = g[k]!.feedVersions.slice(0, 10)
    }
  }

  // Alphabetize user feeds
  if (g.shared) {
    g.shared.feedVersions = g.shared.feedVersions.sort((a, b) => {
      return (a.displayName || '').toLowerCase().localeCompare((b.displayName || '').toLowerCase())
    })
  }
  return g
})

function getFeedVersionOption (id: number): FeedVersionOptionInput | undefined {
  return props.feedVersionOptions.find(fv => fv.id === id)
}

function updateFeedVersionId (idx: number, newId: number | null | undefined) {
  if (newId === null || newId === undefined) return

  const updated = [...internalValue.value]
  const fvOption = getFeedVersionOption(newId)
  const currentItem = updated[idx]

  updated[idx] = {
    id: newId,
    serviceDate: fvOption?.defaultServiceDate || currentItem?.serviceDate || (new Date().toISOString().split('T')[0] ?? ''),
    startTime: currentItem?.startTime,
    endTime: currentItem?.endTime
  }

  internalValue.value = updated
  emit('update:modelValue', updated)
}

function updateServiceDate (idx: number, newDate: string) {
  const updated = [...internalValue.value]
  const currentItem = updated[idx]
  if (!currentItem) return

  updated[idx] = {
    id: currentItem.id,
    serviceDate: newDate,
    startTime: currentItem.startTime,
    endTime: currentItem.endTime
  }

  internalValue.value = updated
  emit('update:modelValue', updated)
}

function updateTimeOfDay (value: string | undefined) {
  if (value !== undefined) {
    emit('update:timeOfDay', value)
  }
}

function addFeedVersion () {
  const firstOption = props.feedVersionOptions[0]
  const newEntry: FeedVersionSelection = {
    id: firstOption?.id || 0,
    serviceDate: firstOption?.defaultServiceDate || (new Date().toISOString().split('T')[0] ?? '')
  }

  const updated = [...internalValue.value, newEntry]
  internalValue.value = updated
  emit('update:modelValue', updated)
}

function removeFeedVersion (idx: number) {
  if (internalValue.value.length <= 1) return // Keep at least one

  const updated = internalValue.value.filter((_, i) => i !== idx)
  internalValue.value = updated
  emit('update:modelValue', updated)
}
</script>

<style scoped>
input[type="date"] {
  width: auto;
}
</style>
