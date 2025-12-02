<template>
  <div>
    <div class="buttons">
      <a class="button is-outlined" :class="errorCount.stops > 0 ? 'is-danger' : ''" @click="openStops = true">
        <i v-if="errorCount.stops > 0" class="mdi mdi-alert has-text-danger" /> Stops
      </a>

      <a class="button is-outlined" :class="errorCount.pathways > 0 ? 'is-danger' : ''" @click="openPathways = true">
        <i v-if="errorCount.pathways > 0" class="mdi mdi-alert has-text-danger" /> Pathways
      </a>

      <a class="button is-outlined" :class="stopPathErrorCount > 0 ? 'is-danger' : ''" @click="openPaths = true">
        <i v-if="stopPathErrorCount > 0" class="mdi mdi-alert has-text-danger" /> Connectivity
      </a>
    </div>

    <t-modal
      v-model="openStops"
      trap-focus
      has-modal-card
      full-screen
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
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
            <span class="button is-small" @click="$emit('select-stop', null); $emit('select-stop', row.id); openStops = false">Select</span>
          </td>
        </template>
      </t-table>
    </t-modal>

    <t-modal
      v-model="openPathways"
      :striped="true"
      trap-focus
      full-screen
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
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
            <span class="button is-small" @click="$emit('select-pathway', null); $emit('select-pathway', row.id); openPathways = false">Select</span>
          </td>
        </template>
      </t-table>
    </t-modal>

    <t-modal
      v-model="openPaths"
      :striped="true"
      trap-focus
      full-screen
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
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
          <t-table-column field="edit" label="Edit" />
        </template>

        <template #default="{ row }">
          <td>{{ row.stop.stop_id }}</td>
          <td>{{ row.stop.stop_name }}</td>
          <td>
            <span> {{ row.paths.filter((s) => { return !s.error }).length }} OK / {{ row.paths.filter((s) => { return s.error }).length }} Errors </span>

            <ul>
              <li v-for="err of row.paths" :key="row.stop.id + '-' + err.target.id">
                <template v-if="err.error || showAllPaths">
                  <span class="button is-small" @click="$emit('select-path', row.stop.id, err.target.id); openPaths = false">Find route</span>
                  <span class="button is-small" @click="$emit('select-stop', err.target.id); openPaths = false">Select dest</span>
                  <t-icon v-if="err.error" icon="alert" variant="error" /><t-icon v-else icon="check" />
                  <span>{{ err.target.stop_name }} ({{ err.target.id }})</span>
                  <span v-if="err.distance > 0">(dist: {{ err.distance.toFixed(0) }} m)
                  </span>
                </template>
              </li>
            </ul>
          </td>
          <td>
            <span class="button is-small" @click="$emit('select-stop', null); $emit('select-stop', row.stop.id); openPaths = false">Select source</span>
          </td>
        </template>
      </t-table>
    </t-modal>
  </div>
</template>

<script>
import { PathwayModes, LocationTypes } from './basemaps'

export default {
  props: {
    station: {
      type: Object,
      default () { return {} }
    }
  },
  emits: ['select-stop', 'select-pathway', 'select-path'],
  data () {
    return {
      openStops: false,
      openPathways: false,
      openPaths: false,
      showAllPaths: false,
      PathwayModes,
      LocationTypes
    }
  },
  computed: {
    stopPaths () {
      const ret = []
      // const stationExits = this.station.stops.filter((s) => { return s.location_type === 2 })
      // const stationPlatforms = this.station.stops.filter((s) => { return s.location_type === 0 || s.location_type === 4 })
      const stationFromStops = this.station.stops.filter((s) => { return s.location_type === 2 })
      const stationMustReach = this.station.stops.filter((s) => { return s.location_type !== 1 })
      for (const stop of stationFromStops) {
        const errs = this.station.validatePathsToStops(stop, stationMustReach)
        if (errs.length > 0) {
          ret.push({ stop, paths: errs })
        }
      }
      return ret
    },
    stopPathErrorCount () {
      let count = 0
      for (const c of this.stopPaths) {
        count = count + c.paths.filter((s) => { return s.error }).length
      }
      return count
    },
    errors () {
      const errors = { stops: {}, pathways: {} }
      for (const stop of this.station.stops) {
        errors.stops[stop.id] = this.validateStop(stop)
      }
      for (const pw of this.pathways) {
        errors.pathways[pw.id] = this.validatePathway(pw)
      }
      errors.paths = 0
      return errors
    },
    errorCount () {
      const count = { stops: 0, pathways: 0 }
      for (const [k, v] of Object.entries(this.errors)) {
        let c = 0
        for (const e of Object.values(v)) {
          c = c + e.length
        }
        count[k] = c
      }
      return count
    },
    levels () {
      return this.station ? this.station.levels : []
    },
    pathways () {
      const pws = []
      for (const stop of this.station.stops) {
        for (const pw of stop.pathways_from_stop || []) {
          pws.push(pw)
        }
      }
      return pws
    }
  },
  methods: {
    routeSummary (stop) {
      if (stop && stop.external_reference && stop.external_reference.target_active_stop && stop.external_reference.target_active_stop.route_stops) {
        return stop.external_reference.target_active_stop.route_stops.map((rs) => { return `${rs.route.agency.agency_id}:${rs.route.route_short_name || rs.route.route_long_name}` }).join(', ')
      }
      return ''
    },
    validateConnectivity (_station) {
      // TODO: "Unreachable location in a station"
      // TODO: "Missing reciprocal pathways"
      return []
    },
    validateStop (stop) {
      const fromPathways = stop.pathways_from_stop || []
      const toPathways = stop.pathways_to_stop || []
      const targetStop = stop.external_reference?.target_active_stop || null
      const errs = []
      if (stop.location_type === 0 && !targetStop) {
        // errs.push({
        //   message: 'Platform (location_type = 0) must have a stop association'
        // })
      }
      if (targetStop && targetStop.location_type !== stop.location_type) {
        errs.push({
          message: `Stop must have the same location_type as the target stop (location_type = ${targetStop.location_type})`
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
      if (stop.external_reference && stop.external_reference.target_active_stop == null) {
        errs.push({
          message: `Cannot resolve reference to stop ${stop.external_reference.target_feed_onestop_id}:${stop.external_reference.target_stop_id}`
        })
      }
      if (stop.location_type !== 1 && stop.location_type !== 0 && (stop.pathways_from_stop || []).length === 0 && (stop.pathways_to_stop || []).length === 0) {
        errs.push({
          message: 'All non-platform stops require at least one connecting pathway'
        })
      }
      if (stop.location_type === 3 && (fromPathways.length + toPathways.length < 2)) {
        errs.push({
          message: 'Dangling generic node - must be able to transit through node to another node'
        })
      }
      if (stop.location_type === 0 && (fromPathways.length + toPathways.length > 1)) {
        errs.push({
          message: 'Do not transit through platforms'
        })
      }
      return errs
    },
    validatePathway (pathway) {
      const errs = []
      if (pathway.from_stop.id === pathway.to_stop.id) {
        errs.push({
          message: 'Pathway is a loop - from_stop_id cannot equal to_stop_id'
        })
      }
      if (pathway.pathway_mode === 7 && pathway.is_bidirectional === 1) {
        errs.push({
          message: 'Exit-gate pathways must be one-way'
        })
      }
      if (pathway.pathway_mode === 2 && pathway.stair_count == null) {
        if (pathway.from_stop.level?.id !== pathway.to_stop.level?.id) {
          // ok
        } else {
          errs.push({
            message: 'Stairs pathways must have a stair_count or connect stops with different levels'
          })
        }
      }
      return errs
    }
  }
}
</script>

<style scoped>
.tl-apps-stations-report {
  width:100%;
}
</style>
