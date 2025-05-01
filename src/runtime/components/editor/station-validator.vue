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

    <o-modal
      v-model:active="openStops"
      trap-focus
      has-modal-card
      full-screen
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
    >
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Station Validation: Stops Report
          </p>
        </header>
        <section class="modal-card-body">
          <o-table
            :data="station.stops"
          >
            <o-table-column v-slot="props" field="stop_id" label="Stop ID" sortable>
              {{ props.row.stop_id }}
            </o-table-column>
            <o-table-column v-slot="props" field="stop_name" label="Stop Name" sortable>
              {{ props.row.stop_name }}
            </o-table-column>
            <o-table-column v-slot="props" field="location_type" label="Location Type" sortable numeric>
              {{ LocationTypes.get(props.row.location_type) || props.row.location_type }}
            </o-table-column>
            <o-table-column v-slot="props" field="level.level_index" label="Level" sortable>
              <span v-if="props.row.level">{{ props.row.level.level_name }}</span><span v-else>None</span>
            </o-table-column>
            <o-table-column v-slot="props" field="pathways" label="Pathways (From/To)">
              {{ props.row.pathways_from_stop.length }} / {{ props.row.pathways_to_stop.length }}
            </o-table-column>
            <o-table-column v-slot="props" field="routes" label="Routes">
              {{ routeSummary(props.row) }}
            </o-table-column>
            <o-table-column v-slot="props" field="errors" label="Errors">
              <div v-if="errors.stops[props.row.id]">
                <ul>
                  <li v-for="err of errors.stops[props.row.id]" :key="props.row.id + err.message">
                    {{ err.message }}
                  </li>
                </ul>
              </div>
            </o-table-column>
            <o-table-column v-slot="props" field="edit" label="Edit">
              <span class="button is-small" @click="$emit('select-stop', null); $emit('select-stop', props.row.id); openStops = false">Select</span>
            </o-table-column>
          </o-table>
        </section>
      </div>
    </o-modal>

    <o-modal
      v-model:active="openPathways"
      :striped="true"
      trap-focus
      full-screen
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
    >
      <div class="modal-card tl-editor-report">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Station Validation: Pathways Report
          </p>
        </header>
        <section class="modal-card-body">
          <o-table
            :data="pathways"
          >
            <o-table-column v-slot="props" field="pathway_id" label="Pathway ID" sortable>
              {{ props.row.pathway_id }}
            </o-table-column>
            <o-table-column v-slot="props" field="pathway_mode" label="Pathway Mode" sortable numeric>
              {{ PathwayModes.get(props.row.pathway_mode) || props.row.pathway_mode }}
            </o-table-column>
            <o-table-column v-slot="props" field="from_stop.stop_name" label="From Stop" sortable>
              {{ props.row.from_stop.stop_name }}
            </o-table-column>
            <o-table-column v-slot="props" field="to_stop.stop_name" label="To Stop" sortable>
              {{ props.row.to_stop.stop_name }}
            </o-table-column>
            <o-table-column v-slot="props" field="is_bidirectional" label="Bidirectional" sortable>
              {{ props.row.is_bidirectional }}
            </o-table-column>
            <o-table-column v-slot="props" field="errors" label="Errors">
              {{ (errors.pathways[props.row.id] || []).map((s)=>{return s.message}).join(', ') }}
            </o-table-column>
            <o-table-column v-slot="props" field="edit" label="Edit">
              <span class="button is-small" @click="$emit('select-pathway', null); $emit('select-pathway', props.row.id); openPathways = false">Select</span>
            </o-table-column>
          </o-table>
        </section>
      </div>
    </o-modal>

    <o-modal
      v-model:active="openPaths"
      :striped="true"
      trap-focus
      full-screen
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
    >
      <div class="modal-card tl-editor-report">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Station Validation: Connectivity Report
          </p>
        </header>
        <section class="modal-card-body">
          <o-checkbox v-model="showAllPaths">
            Show OK Paths
          </o-checkbox>

          <o-table
            :data="stopPaths"
          >
            <o-table-column v-slot="props" field="stop_id" label="Source ID" sortable>
              {{ props.row.stop.stop_id }}
            </o-table-column>
            <o-table-column v-slot="props" field="stop_name" label="Source Name" sortable>
              {{ props.row.stop.stop_name }}
            </o-table-column>
            <o-table-column v-slot="props" field="stopPaths" label="Destinations">
              <span> {{ props.row.paths.filter((s)=>{return !s.error}).length }} OK / {{ props.row.paths.filter((s)=>{return s.error}).length }} Errors </span>

              <ul>
                <li v-for="err of props.row.paths" :key="props.row.stop.id + '-' + err.target.id">
                  <template v-if="err.error || showAllPaths">
                    <span class="button is-small" @click="$emit('select-path', props.row.stop.id, err.target.id); openPaths = false">Find route</span>
                    <span class="button is-small" @click="$emit('select-stop', err.target.id); openPaths = false">Select dest</span>
                    <o-icon v-if="err.error" icon="alert" variant="error" /><o-icon v-else icon="check" />
                    <span>{{ err.target.stop_name }} ({{ err.target.id }})</span>
                    <span v-if="err.distance > 0">(dist: {{ err.distance.toFixed(0) }} m)
                    </span>
                  </template>
                </li>
              </ul>
            </o-table-column>
            <o-table-column v-slot="props" field="edit" label="Edit">
              <span class="button is-small" @click="$emit('select-stop', null); $emit('select-stop', props.row.stop.id); openPaths = false">Select source</span>
            </o-table-column>
          </o-table>
        </section>
      </div>
    </o-modal>
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
      if (stop && stop.stop_ext && stop.stop_ext.target_active_stop && stop.stop_ext.target_active_stop.route_stops) {
        return stop.stop_ext.target_active_stop.route_stops.map((rs) => { return `${rs.route.agency.agency_id}:${rs.route.route_short_name || rs.route.route_long_name}` }).join(', ')
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
      const errs = []
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
      if (stop.stop_ext && stop.stop_ext.target_active_stop == null) {
        errs.push({
          message: `Cannot resolve reference to stop ${stop.stop_ext.target_feed_onestop_id}:${stop.stop_ext.target_stop_id}`
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
      return errs
    },
    validatePathway (pathway) {
      const errs = []
      if (pathway.from_stop.id === pathway.to_stop.id) {
        errs.push({
          message: 'Pathway is a loop - from_stop_id cannot equal to_stop_id'
        })
      }
      // if ((pathway.pathway_mode === 6 || pathway.pathway_mode === 7) && pathway.is_bidirectional === 1) {
      //   errs.push({
      //     message: 'Fare-gate and exit-gate pathways must be one-way'
      //   })
      // }
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
.tl-editor-report {
  width:100%;
}
</style>
