<template>
  <div>
    <div class="buttons">
      <a class="button is-outlined" :class="errorCount.stops > 0 ? 'is-danger' : 'is-dark'" @click="openStops = true">
        <i v-if="errorCount.stops > 0" class="mdi mdi-alert has-text-danger" /> Stops
      </a>

      <a class="button is-outlined" :class="errorCount.pathways > 0 ? 'is-danger' : 'is-dark'" @click="openPathways = true">
        <i v-if="errorCount.pathways > 0" class="mdi mdi-alert has-text-danger" /> Pathways
      </a>

      <a class="button is-outlined" :class="stopPathErrorCount > 0 ? 'is-danger' : 'is-dark'" @click="openPaths = true">
        <i v-if="stopPathErrorCount > 0" class="mdi mdi-alert has-text-danger" /> Connectivity
      </a>
    </div>

    <t-modal
      v-model="openStops"
      full-screen
      title="Station validation: Stops Report"
    >
      <t-table
        :data="station.stops"
        hoverable
        striped
      >
        <template #columns>
          <t-table-column field="stop_id" label="Stop ID" sortable />
          <t-table-column field="stop_name" label="Stop Name" sortable />
          <t-table-column field="location_type" label="Location Type" sortable numeric />
          <t-table-column field="level.level_index" label="Level" sortable />
          <t-table-column field="pathways" label="Pathways (From/To)" />
          <t-table-column field="routes" label="Routes" />
          <t-table-column field="errors" label="Errors" />
          <t-table-column field="edit" label="Edit" />
        </template>

        <template #default="{ row }">
          <td>{{ row.stop_id }}</td>
          <td>{{ row.stop_name }}</td>
          <td class="has-text-right">
            {{ LocationTypes.get(row.location_type) || row.location_type }}
          </td>
          <td>
            <span v-if="row.level">{{ row.level.level_name }}</span><span v-else>None</span>
          </td>
          <td>
            {{ row.pathways_from_stop.length }} / {{ row.pathways_to_stop.length }}
          </td>
          <td>
            {{ routeSummary(row) }}
          </td>
          <td>
            <div v-if="errors.stops[row.id]">
              <ul>
                <li v-for="err of errors.stops[row.id]" :key="row.id + err.message">
                  {{ err.message }}
                </li>
              </ul>
            </div>
          </td>
          <td>
            <span class="button is-small" @click="emit('selectStop', null); emit('selectStop', row.id); openStops = false">Select</span>
          </td>
        </template>
      </t-table>
    </t-modal>

    <t-modal
      v-model="openPathways"
      full-screen
      title="Station Validation: Pathways Report"
    >
      <t-table
        :data="pathways"
        hoverable
        striped
      >
        <template #columns>
          <t-table-column field="pathway_id" label="Pathway ID" sortable />
          <t-table-column field="pathway_mode" label="Pathway Mode" sortable numeric />
          <t-table-column field="from_stop.stop_name" label="From Stop" sortable />
          <t-table-column field="to_stop.stop_name" label="To Stop" sortable />
          <t-table-column field="is_bidirectional" label="Bidirectional" sortable />
          <t-table-column field="errors" label="Errors" />
          <t-table-column field="edit" label="Edit" />
        </template>

        <template #default="{ row }">
          <td>{{ row.pathway_id }}</td>
          <td class="has-text-right">
            {{ PathwayModes.get(row.pathway_mode) || row.pathway_mode }}
          </td>
          <td>{{ row.from_stop.stop_name }}</td>
          <td>{{ row.to_stop.stop_name }}</td>
          <td>{{ row.is_bidirectional }}</td>
          <td>{{ (errors.pathways[row.id] || []).map((s) => { return s.message }).join(', ') }}</td>
          <td>
            <span class="button is-small" @click="emit('selectPathway', null); emit('selectPathway', row.id); openPathways = false">Select</span>
          </td>
        </template>
      </t-table>
    </t-modal>

    <t-modal
      v-model="openPaths"
      full-screen
      title="Station Validation: Connectivity Report"
    >
      <t-checkbox v-model="showAllPaths">
        Show OK Paths
      </t-checkbox>

      <t-table
        :data="stopPaths"
        hoverable
        striped
      >
        <template #columns>
          <t-table-column field="stop_id" label="Source ID" sortable />
          <t-table-column field="stop_name" label="Source Name" sortable />
          <t-table-column field="stopPaths" label="Destinations" />
        </template>

        <template #default="{ row }">
          <td>{{ row.stop.stop_id }}</td>
          <td>{{ row.stop.stop_name }}</td>
          <td>
            <div class="is-flex is-align-items-center is-justify-content-space-between mb-2">
              <span>{{ row.paths.filter((s: any) => { return !s.error }).length }} OK / {{ row.paths.filter((s: any) => { return s.error }).length }} Errors</span>
              <t-button size="small" @click="emit('selectStop', null); emit('selectStop', row.stop.id); openPaths = false">
                Select source
              </t-button>
            </div>

            <ul class="mt-2">
              <li v-for="err of row.paths" :key="row.stop.id + '-' + err.target.id" class="mb-1">
                <div v-if="err.error || showAllPaths" class="is-flex is-align-items-start">
                  <t-icon v-if="err.error" icon="alert" variant="danger" class="mr-2" style="flex-shrink: 0;" />
                  <t-icon v-else icon="check" class="mr-2" style="flex-shrink: 0;" />
                  <span class="is-flex-grow-1" style="word-break: break-word; min-width: 0;">
                    <span>{{ err.target.stop_name || 'Node' }}</span>
                    <span class="has-text-grey"> ({{ err.target.stop_id }})</span>
                    <span v-if="err.distance && err.distance > 0" class="has-text-grey-light"> — {{ err.distance.toFixed(0) }}m</span>
                  </span>
                  <div class="buttons has-addons ml-2" style="flex-shrink: 0;">
                    <t-button size="small" @click="emit('selectPath', row.stop.id, err.target.id); openPaths = false">
                      Find route
                    </t-button>
                    <t-button size="small" @click="emit('selectStop', err.target.id); openPaths = false">
                      Select
                    </t-button>
                  </div>
                </div>
              </li>
            </ul>
          </td>
        </template>
      </t-table>
    </t-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PathwayModes } from '../../lib/pathways/pathway-icons'
import { LocationTypes } from './basemaps'
import type { Station, Stop, Pathway } from './station'
import type { ValidationPath } from './types'

interface ValidationError {
  message: string
}

interface StopPathData {
  stop: Stop
  paths: ValidationPath[]
}

interface Props {
  station: Station
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectStop: [id: number | null]
  selectPathway: [id: number | null]
  selectPath: [sourceId: number, targetId: number]
}>()

const openStops = ref(false)
const openPathways = ref(false)
const openPaths = ref(false)
const showAllPaths = ref(false)

const stopPaths = computed((): StopPathData[] => {
  const ret: StopPathData[] = []
  const stationFromStops = props.station.stops.filter((s) => { return s.location_type === 2 })
  const stationMustReach = props.station.stops.filter((s) => { return s.location_type !== 1 })
  for (const stop of stationFromStops) {
    const errs = props.station.validatePathsToStops(stop, stationMustReach)
      .filter((path) => { return path.target.id !== stop.id })
    if (errs.length > 0) {
      ret.push({ stop, paths: errs })
    }
  }
  return ret
})

const stopPathErrorCount = computed((): number => {
  let count = 0
  for (const c of stopPaths.value) {
    count = count + c.paths.filter((s) => { return s.error }).length
  }
  return count
})

const errors = computed((): { stops: Record<number, ValidationError[]>, pathways: Record<number, ValidationError[]> } => {
  const errors: { stops: Record<number, ValidationError[]>, pathways: Record<number, ValidationError[]> } = { stops: {}, pathways: {} }
  for (const stop of props.station.stops) {
    if (stop.id) {
      errors.stops[stop.id] = validateStop(stop, props.station.stops)
    }
  }
  for (const pw of pathways.value) {
    if (pw.id) {
      errors.pathways[pw.id] = validatePathway(pw)
    }
  }
  return errors
})

const errorCount = computed((): { stops: number, pathways: number } => {
  const count = { stops: 0, pathways: 0 }
  for (const [k, v] of Object.entries(errors.value)) {
    let c = 0
    for (const e of Object.values(v)) {
      if (Array.isArray(e)) {
        c = c + e.length
      }
    }
    if (k === 'stops' || k === 'pathways') {
      count[k] = c
    }
  }
  return count
})

const _levels = computed((): Array<typeof props.station.levels[0]> => {
  return props.station ? props.station.levels : []
})

const pathways = computed((): Pathway[] => {
  const pws: Pathway[] = []
  for (const stop of props.station.stops) {
    for (const pw of stop.pathways_from_stop || []) {
      pws.push(pw)
    }
  }
  return pws
})

function routeSummary (stop: Stop): string {
  if (stop && stop.external_reference && stop.external_reference.target_active_stop && stop.external_reference.target_active_stop.route_stops) {
    return stop.external_reference.target_active_stop.route_stops
      .filter(rs => rs.route)
      .map((rs) => { return `${rs.route?.agency?.agency_id}:${rs.route?.route_short_name || rs.route?.route_long_name}` })
      .join(', ')
  }
  return ''
}

function _validateConnectivity (_station: Station): ValidationError[] {
  // TODO: "Unreachable location in a station"
  // TODO: "Missing reciprocal pathways"
  return []
}

function validateStop (stop: Stop, stationStops: Stop[]): ValidationError[] {
  const fromPathways = stop.pathways_from_stop || []
  const toPathways = stop.pathways_to_stop || []
  const targetStop = stop.external_reference?.target_active_stop || null
  const errs: ValidationError[] = []
  if (stop.location_type === 0 && !targetStop) {
    // errs.push({
    //   message: 'Platform (location_type = 0) must have a stop association'
    // })
  }
  if (targetStop && targetStop.location_type !== stop.location_type) {
    errs.push({
      message: `Interline recommendation: stop must have the same location_type as the target stop (location_type = ${targetStop.location_type})`
    })
  }
  // if (stop.location_type === 2 && !stop.external_reference?.target_active_stop) {
  //   errs.push({
  //     message: 'Entrance (location_type = 2) must have a stop association'
  //   })
  // }
  if (stop.location_type === 1 && (fromPathways.length > 0 || toPathways.length > 0)) {
    errs.push({
      message: 'Pathways cannot use Station (location_type = 1)'
    })
  }
  if (stop.parent?.id && stop.parent.id === stop.id) {
    errs.push({
      message: 'Cannot have self as parent_station'
    })
  }
  if (stop.location_type !== 4 && stop.parent?.id && stop.parent.location_type !== 1) {
    errs.push({
      message: 'The parent_station must be a Station (location_type = 1)'
    })
  }
  if (
    (stop.location_type === 4 && stop.parent === null) || (stop.location_type === 4 && stop.parent && stop.parent.location_type !== 0)
  ) {
    errs.push({
      message: 'Boarding areas require a Platform (location_type = 0) as a parent_station'
    })
  }
  if (stop.external_reference && stop.external_reference.target_active_stop === null) {
    errs.push({
      message: `Interline recommendation: cannot resolve reference to stop ${stop.external_reference.target_feed_onestop_id}:${stop.external_reference.target_stop_id}`
    })
  }
  const hasBoardingAreas = stop.location_type === 0 && stationStops.some(s => s.location_type === 4 && s.parent?.id === stop.id)
  if (stop.location_type !== 1 && !hasBoardingAreas && fromPathways.length === 0 && toPathways.length === 0) {
    errs.push({
      message: 'All locations within a station require at least one connecting pathway, except platforms with boarding areas'
    })
  }
  if (stop.location_type === 3 && (fromPathways.length + toPathways.length < 2)) {
    errs.push({
      message: 'Interline recommendation: generic nodes should connect to at least two pathways so a rider can transit through the node to another node'
    })
  }
  if (stop.location_type === 0) {
    if (hasBoardingAreas && (fromPathways.length + toPathways.length > 0)) {
      errs.push({
        message: 'Platforms with boarding areas must not have pathways; assign pathways to the boarding areas instead'
      })
    } else if (!hasBoardingAreas && (fromPathways.length + toPathways.length > 1)) {
      errs.push({
        message: 'Interline recommendation: do not transit through platforms'
      })
    }
  }
  if (stop.location_type === 4 && stop.parent?.id) {
    const allPathways = [...fromPathways, ...toPathways]
    const hasParentPathway = allPathways.some(pw => pw.from_stop.id === stop.parent!.id || pw.to_stop.id === stop.parent!.id)
    if (hasParentPathway) {
      errs.push({
        message: 'Boarding areas connect to their parent platform via the parent_station setting, not via drawn pathways'
      })
    }
  }
  return errs
}

function validatePathway (pathway: Pathway): ValidationError[] {
  const errs: ValidationError[] = []
  if (pathway.from_stop.id === pathway.to_stop.id) {
    errs.push({
      message: 'Interline recommendation: pathway is a loop — from_stop_id should not equal to_stop_id'
    })
  }
  if (pathway.pathway_mode === 7 && pathway.is_bidirectional === 1) {
    errs.push({
      message: 'Exit-gate pathways must be one-way'
    })
  }
  if (pathway.pathway_mode === 2 && pathway.stair_count === null) {
    if (pathway.from_stop.level?.id !== pathway.to_stop.level?.id) {
      // ok
    } else {
      errs.push({
        message: 'Interline recommendation: stairs pathways should have a stair_count or connect stops with different levels'
      })
    }
  }
  return errs
}
</script>

<style scoped>
.tl-apps-stations-report {
  width:100%;
}
</style>
