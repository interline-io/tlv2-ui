<template>
  <div>
    <div class="columns">
      <div class="column is-one-half">
        <t-field label="Stop ID">
          <code v-if="readOnly">{{ entity.stop_id }}</code>
          <span v-else-if="targetActiveStop">
            <t-input v-model="targetActiveStop.stop_id" disabled icon-right="target" /><br>
            <t-input v-model="entity.stop_id" class="mt-2" />
          </span>
          <t-input v-else v-model="entity.stop_id" />
        </t-field>

        <t-field label="Name">
          <span v-if="readOnly">{{ entity.stop_name }}</span>
          <span v-else-if="targetActiveStop">
            <t-input v-model="targetActiveStop.stop_name" disabled icon-right="target" /><br>
            <t-input v-model="entity.stop_name" class="mt-2" />
          </span>
          <t-input v-else v-model="entity.stop_name" />
        </t-field>

        <t-field label="Platform Code">
          <span v-if="readOnly">{{ entity.platform_code }}</span>
          <t-input v-else v-model="entity.platform_code" />
        </t-field>

        <t-field label="Location Type">
          <t-select v-model="locationTypeStr" :disabled="readOnly">
            <option v-for="[type, label] of LocationTypes.entries()" :key="type" :value="String(type)">
              {{ label }}
            </option>
          </t-select>
        </t-field>

        <t-field>
          <t-switch v-model="entity.wheelchair_boarding" :true-value="1" :false-value="0" :disabled="readOnly">
            Wheelchair boarding
          </t-switch>
        </t-field>
      </div>

      <div class="column is-one-half">
        <t-field label="Level">
          <t-select v-model="levelIdStr" :disabled="readOnly">
            <option v-for="level of station.levels" :key="level.id" :value="String(level.id)">
              {{ level.level_name }}
            </option>
          </t-select>
        </t-field>

        <t-field v-if="(entity.location_type === 4 || (entity.parent && entity.parent?.id !== station.id))" label="Parent">
          <t-dropdown
            v-model="entity.parent.id"
            selectable
            :label="parentStop ? parentStop.stop_name : 'None'"
          >
            <!-- eslint-disable vue/attribute-hyphenation -->
            <t-dropdown-item v-if="station.stop" :value="station.stop.id" :ariaRole="'listitem'">
              <h3>{{ station.stop.stop_name }}</h3>
              <small> Station </small>
            </t-dropdown-item>
            <!-- Stops can be "lost" if parent is unset completely. Don't allow this in UI -->
            <!-- <t-dropdown-item :value="-1" :ariaRole="'listitem'">
              <h3>No parent</h3>
            </t-dropdown-item> -->
            <t-dropdown-item v-for="ss of platformStops" :key="ss.id" :value="ss.id" :ariaRole="'listitem'" :disabled="ss.id === entity.id">
              <!-- eslint-enable vue/attribute-hyphenation -->
              <h3>{{ ss.stop_name }}</h3>
              <small> Platform: {{ routeSummary(ss) }}</small>
            </t-dropdown-item>
          </t-dropdown>
        </t-field>

        <!-- Association editor -->
        <template v-if="showStopAssociations">
          <!-- A target association is set (from result) -->
          <t-field v-if="value.external_reference?.target_feed_onestop_id" label="Target">
            <span v-if="targetActiveStop" class="button stop-label is-info">
              <t-icon icon="check" class="mr-2" /> {{ targetActiveStop.stop_name }} ({{ targetActiveStop.stop_id }})
            </span>
            <span v-else class="button stop-label is-danger">
              <t-icon icon="alert-circle-outline" class="mr-2" /> Not found: {{ value.external_reference.target_feed_onestop_id }}:{{ value.external_reference.target_stop_id }}
            </span>
          </t-field>

          <!-- Edit target -->
          <t-field v-if="entity.external_reference" label="Target Feed">
            <t-input v-model="entity.external_reference.target_feed_onestop_id" />
          </t-field>
          <t-field v-if="entity.external_reference" label="Target Stop">
            <t-input v-model="entity.external_reference.target_stop_id" />
          </t-field>
          <span v-if="!readOnly" class="button stop-label" @click="deleteAssociation">Remove association</span><br><br>
        </template>
        <template v-else-if="stopAssociationsEnabled && !readOnly">
          <span class="button" @click="createAssociation">Add association</span>
        </template>
      </div>
    </div>

    <!-- Pathways viewer -->
    <t-field v-if="pathwaysFromStop.length > 0" label="Pathways (From)">
      <ul>
        <li v-for="pw of pathwaysFromStop" :key="pw.id">
          <span class="button" :title="pw.pathway_id" @click="emit('selectPathway', pw.id!)">
            <span class="tl-path-icon"><img :src="pathwayIcon(pw.pathway_mode ?? 0).url" :title="pathwayIcon(pw.pathway_mode ?? 0).label"></span>
            <span v-if="pw.is_bidirectional === 1">
              ↔
            </span>
            <span v-else>
              →
            </span>
            {{ pw.to_stop.stop_name }}
          </span>
        </li>
      </ul>
    </t-field>
    <t-field v-if="pathwaysToStop.length" label="Pathways (To)">
      <ul>
        <li v-for="pw of pathwaysToStop" :key="pw.id">
          <span class="button" :title="pw.pathway_id" @click="emit('selectPathway', pw.id!)">
            <span class="tl-path-icon"><img :src="pathwayIcon(pw.pathway_mode ?? 0).url" :title="pathwayIcon(pw.pathway_mode ?? 0).label"></span>
            <span v-if="pw.is_bidirectional === 1">
              ↔
            </span>
            <span v-else>
              ←
            </span>
            {{ pw.from_stop.stop_name }}
          </span>
        </li>
      </ul>
    </t-field>

    <!-- Show target routes -->
    <t-field v-if="targetActiveStop" label="Routes (Associated)">
      <ul>
        <li v-for="rt of targetActiveStop.route_stops" :key="rt.route?.id">
          {{ rt.route?.agency?.agency_id }}:{{ rt.route?.route_short_name || rt.route?.route_long_name }}
        </li>
      </ul>
    </t-field>

    <!-- Associated routes viewer -->
    <t-field v-if="value.route_stops?.length" label="Routes (Direct)">
      <ul>
        <li v-for="rt of value.route_stops || []" :key="rt.route?.id">
          {{ rt.route?.agency?.agency_id }}:{{ rt.route?.route_short_name || rt.route?.route_long_name }}
        </li>
      </ul>
    </t-field>

    <template v-if="!readOnly">
      <div v-if="entity.id" class="buttons is-justify-content-flex-end">
        <t-tooltip :text="deleteTooltip">
          <t-button
            class="button is-danger"
            :disabled="hasAssociatedPathways"
            @click="deleteStop"
          >
            Delete stop
          </t-button>
        </t-tooltip>
        <t-button class="button is-primary ml-3" @click="updateStop">
          Save stop
        </t-button>
      </div>
      <div v-else class="buttons is-justify-content-flex-end">
        <t-button class="button is-primary" @click="createStop">
          Add stop
        </t-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Point } from 'geojson'
import { PathwayModeIcons } from '../../lib/pathways/pathway-icons'
import { LocationTypes } from './basemaps'
import { Stop } from './station'
import type { StopData, StationData, RouteStopData } from './types'

interface EntityData {
  id?: number
  stop_id?: string
  stop_name?: string
  platform_code?: string
  location_type?: number
  geometry?: Point
  wheelchair_boarding?: number
  parent: { id?: number }
  level: { id?: number }
  external_reference?: {
    target_feed_onestop_id?: string
    target_stop_id?: string
  }
}

interface Props {
  value?: StopData
  station: StationData
  readOnly?: boolean
  stopAssociationsEnabled?: boolean
  currentMode?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: () => ({} as StopData),
  readOnly: false,
  stopAssociationsEnabled: false,
  currentMode: 'pathways'
})

const emit = defineEmits<{
  selectPathway: [id: number]
  createAssociation: []
  update: [stop: Stop]
  delete: [stop: Stop]
  create: [stop: Stop]
}>()

const stopCopy = new Stop(props.value).setDefaults()
const entity = ref<EntityData>({
  id: stopCopy.id,
  stop_id: stopCopy.stop_id,
  stop_name: stopCopy.stop_name,
  platform_code: stopCopy.platform_code,
  location_type: stopCopy.location_type,
  geometry: stopCopy.geometry,
  wheelchair_boarding: stopCopy.wheelchair_boarding,
  parent: { id: stopCopy.parent?.id },
  level: { id: stopCopy.level?.id },
  external_reference: stopCopy.external_reference
    ? {
        target_feed_onestop_id: stopCopy.external_reference?.target_feed_onestop_id,
        target_stop_id: stopCopy.external_reference?.target_stop_id,
      }
    : undefined
})

const showStopAssociations = ref(!!stopCopy.external_reference)
const targetActiveStop = ref(stopCopy.external_reference?.target_active_stop || null)
const pathwaysFromStop = ref(stopCopy.pathways_from_stop || [])
const pathwaysToStop = ref(stopCopy.pathways_to_stop || [])

const locationTypeStr = computed({
  get (): string {
    return String(entity.value.location_type ?? '')
  },
  set (value: string) {
    entity.value.location_type = value ? Number.parseInt(value, 10) : undefined
  }
})

const levelIdStr = computed({
  get (): string {
    return String(entity.value.level.id ?? '')
  },
  set (value: string) {
    entity.value.level.id = value ? Number.parseInt(value, 10) : undefined
  }
})

const platformStops = computed((): StopData[] => {
  return props.station.stops.filter((s) => { return s.location_type === 0 })
})

const parentStop = computed((): StopData | null => {
  if (entity.value.parent?.id === props.station.id) {
    return props.station.stop!
  }
  for (const s of props.station.stops) {
    if (s.id === entity.value.parent?.id) {
      return s
    }
  }
  return null
})

const hasAssociatedPathways = computed((): boolean => {
  return pathwaysFromStop.value.length > 0 || pathwaysToStop.value.length > 0
})

const deleteTooltip = computed((): string => {
  if (hasAssociatedPathways.value) {
    return 'This stop has associated pathways and cannot be deleted. First remove all pathways connected to this stop.'
  }
  return 'Delete this stop'
})

const _coordinates = computed((): string => {
  const coords = entity.value.geometry?.coordinates
  if (!coords || coords.length < 2 || coords[0] === undefined || coords[1] === undefined) {
    return '0.00000, 0.00000'
  }
  return `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`
})

function updateStop () {
  emit('update', new Stop(entity.value as unknown as StopData))
}

function createStop () {
  emit('create', new Stop(entity.value as unknown as StopData))
}

function deleteStop () {
  emit('delete', new Stop(entity.value as unknown as StopData))
}

function createAssociation () {
  entity.value.external_reference = {
    target_feed_onestop_id: '',
    target_stop_id: ''
  }
  showStopAssociations.value = true
}

function deleteAssociation () {
  showStopAssociations.value = false
  entity.value.external_reference = undefined
}

function pathwayIcon (mode: number): { url: string, label: string } {
  const m = PathwayModeIcons[mode]
  if (!m) {
    return { url: '', label: '' }
  }
  return { url: `/icons/${m.altIcon ? m.altIcon : m.icon}.png`, label: m.label }
}

function routeSummary (ss: StopData): string {
  return (ss?.external_reference?.target_active_stop?.route_stops || [])
    .map((rs: RouteStopData) => { return `${rs.route!.agency!.agency_id}:${rs.route!.route_short_name || rs.route!.route_long_name}` })
    .join(', ')
}
</script>

<style>
.tl-path-icon {
  width:24px;
}
.tl-path-icon img {
  height: 20px;
}
.stop-label {
  max-width:200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  justify-content: left;
}
</style>
