<template>
  <div v-if="station" class="station-pathways-container">
    <div v-if="ready" class="columns pathways-columns">
      <div class="column is-narrow">
        <div class="block tl-editor-info">
          <!-- Mode Selection -->
          <nav class="panel station-editor-panel">
            <p class="panel-heading">
              Mode
            </p>
            <div class="panel-block">
              <div class="buttons has-addons is-fullwidth">
                <button
                  class="button"
                  :class="{'is-primary is-selected': selectMode === 'select'}"
                  @click="selectMode = 'select'"
                >
                  Select
                </button>
                <button
                  class="button"
                  :class="{'is-primary is-selected': selectMode === 'add-node'}"
                  @click="selectMode = 'add-node'"
                >
                  Add Node
                </button>
                <button
                  class="button"
                  :class="{'is-primary is-selected': selectMode === 'add-pathway'}"
                  :disabled="!(selectedStop && selectedSource)"
                  @click="selectMode = 'add-pathway'"
                >
                  Add Pathway
                </button>
                <button
                  class="button"
                  :class="{'is-primary is-selected': selectMode === 'find-route'}"
                  @click="selectMode = 'find-route'"
                >
                  Find Route
                </button>

                <button
                  class="button"
                  :class="{'is-primary is-selected': selectMode === 'export'}"
                  @click="selectMode = 'export'"
                >
                  Export
                </button>
              </div>
            </div>
          </nav>

          <!-- Map Controls -->
          <nav class="panel station-editor-panel">
            <p class="panel-heading">
              Map Display
            </p>
            <div class="panel-block is-block">
              <o-collapse v-model:open="levelsOpen" animation="slide">
                <template #trigger="props">
                  <div class="field collapse-trigger-field">
                    <label class="label is-small collapse-trigger-label">
                      <o-icon :icon="props.open ? 'menu-down' : 'menu-right'" />
                      <span>Levels</span>
                    </label>
                  </div>
                </template>
                <div v-for="level of sortedStationLevels" :key="level.id" class="ml-4">
                  <o-checkbox
                    v-model="selectedLevels"
                    :native-value="mapLevelKeyFn(level)"
                  >
                    <span v-if="level.level_index != null" class="has-text-weight-semibold">{{ level.level_index }}:</span>
                    {{ level.level_name }}
                    <span class="has-text-grey is-size-7">({{ level.stops.length }} nodes)</span>
                  </o-checkbox>
                </div>
              </o-collapse>

              <o-collapse v-model:open="basemapOpen" animation="slide">
                <template #trigger="props">
                  <div class="field collapse-trigger-field">
                    <label class="label is-small collapse-trigger-label">
                      <o-icon :icon="props.open ? 'menu-down' : 'menu-right'" />
                      <span>Basemap</span>
                    </label>
                  </div>
                </template>
                <div v-for="(bm, key) in basemapLayers" :key="key" class="field ml-4">
                  <o-radio
                    v-model="basemap"
                    :native-value="key"
                  >
                    {{ bm.label }}
                  </o-radio>
                </div>
              </o-collapse>

              <o-collapse v-model:open="legendOpen" animation="slide">
                <template #trigger="props">
                  <div class="field collapse-trigger-field">
                    <label class="label is-small collapse-trigger-label">
                      <o-icon :icon="props.open ? 'menu-down' : 'menu-right'" />
                      <span>Legend</span>
                    </label>
                  </div>
                </template>
                <div class="ml-4">
                  <ul>
                    <li class="legend-item circle-indicator">
                      circles are nodes (stops) with number for assigned level
                    </li>
                    <li class="legend-item blue-rectangle">
                      blue pathways are on the same level
                    </li>
                    <li class="legend-item red-rectangle">
                      red pathways connect two separate levels
                    </li>
                    <li class="legend-item purple-rectangle">
                      purple lines show distance to associated stop
                    </li>
                  </ul>
                </div>
              </o-collapse>
            </div>
          </nav>
          <!-- SELECT -->
          <tl-editor-station-pathways-select-panel
            v-if="selectMode === 'select'"
            :selected-stops-count="selectedStops.length"
            :selected-pathways-count="selectedPathways.length"
            :selected-stops="selectedStops"
            :selected-pathways="selectedPathways"
            :last-filter-applied="lastFilterApplied"
            :location-types="LocationTypes"
            :pathway-modes="PathwayModes"
            @unselect-all="unselectAll"
            @select-stop="selectStop"
            @select-pathway="selectPathway"
            @hover-stop="hoverStopId = $event"
            @hover-pathway="hoverPathwayId = $event"
            @select-location-types="selectLocationTypes"
            @select-stops-with-associations="selectStopsWithAssociations"
            @select-stops-platforms-without-associations="selectStopsPlatformsWithoutAssociations"
            @select-stops-entrances-without-associations="selectStopsEntrancesWithoutAssociations"
            @select-stops-with-paired-pathways="selectStopsWithPairedPathways"
            @select-pathway-modes="selectPathwayModes"
            @select-pathways-with-pairs="selectPathwaysWithPairs"
            @select-pathways-oneway="selectPathwaysOneway"
            @select-pathways-bidirectional="selectPathwaysBidirectional"
          />
          <tl-editor-station-pathways-add-pathway-panel
            v-else-if="selectMode === 'add-pathway'"
            :station="station"
            :pathway="newPathway()"
            @select-stop="selectStop"
            @create="createPathwayHandler"
          />
          <template v-if="selectMode === 'edit-pathway'">
            <tl-editor-station-pathways-pathway-panel
              v-for="spw of selectedPathways"
              :key="spw.id"
              :station="station"
              :pathway="spw"
              :show-unselect="selectedStops.length > 0 || selectedPathways.length > 0"
              :feed-key="feedKey"
              :feed-version-key="feedVersionKey"
              :station-key="stationKey"
              @select-stop="selectStop"
              @hover-stop="hoverStopId = $event"
              @delete="deletePathwayHandler"
              @update="updatePathwayHandler"
              @unselect="unselectAll"
            />
          </template>
          <template v-else-if="selectMode === 'edit-node'">
            <tl-editor-station-pathways-node-panel
              v-for="ss of selectedStops"
              :key="ss.id"
              :station="station"
              :stop="ss"
              :stop-associations-enabled="stopAssociationsEnabled"
              :show-unselect="selectedStops.length > 0 || selectedPathways.length > 0"
              :feed-key="feedKey"
              :feed-version-key="feedVersionKey"
              :station-key="stationKey"
              @delete="deleteStopHandler"
              @update="updateStopHandler"
              @delete-association="deleteAssociationHandler"
              @select-pathway="selectPathway"
              @hover-pathway="hoverPathwayId = $event"
              @unselect="unselectAll"
            />
          </template>
          <tl-editor-station-pathways-add-node-panel
            v-else-if="selectMode === 'add-node'"
            :selected-level="selectedLevel"
            :levels="station.levels"
            :level-index="levelIndex"
            @update:selected-level="selectedLevel = $event"
          />
          <tl-editor-station-pathways-find-route-panel
            v-else-if="selectMode === 'find-route' && selectedStops.length > 1"
            :path="selectedPath"
          />
          <nav v-else-if="selectMode === 'export'" class="panel station-editor-panel">
            <p class="panel-heading">
              Export
            </p>
            <div class="panel-block is-block">
              <p class="notification">
                To export as a full GTFS feed, exit the pathways editor and
                <nuxt-link
                  :to="{
                    path: `/saas/station-editor/${feedKey}/${feedVersionKey}/stations`
                  }"
                >
                  return to the feed version
                </nuxt-link>
              </p>
              <o-button icon-left="download" expanded @click="downloadGeojson">
                Download this station as GeoJSON
              </o-button>
            </div>
          </nav>

          <!-- Validation Reports -->
          <nav class="panel station-editor-panel">
            <p class="panel-heading">
              Station Validation Reports
            </p>
            <div class="panel-block is-block">
              <tl-editor-station-validator
                :station="station"
                @select-path="selectPath"
                @select-stop="selectStop"
                @select-pathway="selectPathway"
              />
            </div>
          </nav>
        </div>
      </div>

      <div class="column">
        <tl-editor-pathway-map
          :center="station.geometry.coordinates"
          :station="station"
          :basemap="basemap"
          :selected-stops="selectedStops"
          :selected-pathways="selectMode === 'find-route' && selectedPath ? selectedPath.map((s)=>{return s.pathway}) : selectedPathways"
          :selected-levels="selectedLevels"
          :hover-stop-id="hoverStopId"
          :hover-pathway-id="hoverPathwayId"
          @select-stop="selectStop"
          @select-pathway="selectPathway"
          @select-point="selectPoint"
          @move-stop-save="moveStopSave"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { PathwayModes, LocationTypes, getBasemapLayers } from '../basemaps'
import { Stop, Pathway, mapLevelKeyFn } from '../station'
import StationMixin from './station-mixin'
import { nextTick } from 'vue'
import { useToastNotification } from '../../../composables/useToastNotification'

export default {
  mixins: [StationMixin],
  layout: 'wide',
  query: ['selectedStop', 'selectedPathway'],
  setup () {
    const { showToast } = useToastNotification()
    return { showToast }
  },
  data () {
    return {
      id: undefined,
      selectMode: 'select',
      selectedPoint: null,
      selectedStops: [],
      selectedPathways: [],
      openStationValidator: false,
      basemap: 'carto',
      basemapLayers: getBasemapLayers(),
      levelsOpen: true,
      basemapOpen: false,
      legendOpen: false,
      lastFilterApplied: '',
      hoverStopId: null,
      hoverPathwayId: null,
      PathwayModes,
      LocationTypes
    }
  },
  computed: {
    selectedPath () {
      if (this.selectMode !== 'find-route' || this.selectedStops.length < 2) {
        return null
      }
      const p = this.station.findRoute(this.selectedStops[0].id, this.selectedStops[1].id)
      const edges = []
      for (const edge of p.edges || []) {
        edges.push({
          cost: 0,
          pathway: this.pathwayIndex[edge.pathway_id]
        })
      }
      return edges
    },
    selectedSource () {
      if (this.selectedStops.length === 2) {
        return this.selectedStops[0]
      }
      return null
    },
    selectedStop () {
      if (this.selectedStops.length > 0) {
        return this.selectedStops[this.selectedStops.length - 1]
      }
      return null
    },
    levelIndex () {
      const si = {}
      for (const level of this.station.levels) {
        si[level.id] = level
      }
      return si
    },
    pathwayIndex () {
      const pwi = {}
      for (const pw of this.station.pathways) {
        pwi[pw.id] = pw
      }
      return pwi
    },
    sortedStationLevels () {
      return this.station.levels.slice(0).sort(
        (a, b) => (b.level_index != null ? b.level_index : -Infinity) - (a.level_index != null ? a.level_index : -Infinity)
      )
    }
  },
  watch: {
    // Wait for all stops to be loaded before selecting from query params
    // This ensures the selectedStop exists when coming from external links (e.g., stop associations page)
    ready () {
      if (this.ready && this.$route.query.selectedStop) {
        this.selectStop(Number(this.$route.query.selectedStop))
      }
      if (this.ready && this.$route.query.selectedPathway) {
        this.selectPathway(this.$route.query.selectedPathway)
      }
    },
    selectedLevels () {
      if (this.$route.query.selectedStop || this.$route.query.selectedPathway) {
        // nothing
      } else {
        this.selectedStops = []
        this.selectedPathways = []
      }
      this.selectMode = 'select'
    },
    selectMode () {
      if (this.selectMode === 'add-node') {
        this.selectedStops = []
        this.selectedPathways = []
      }
    }
  },
  mounted () {
    // Add ESC key listener to unselect all
    this.handleEscKey = (event) => {
      if (event.key === 'Escape') {
        this.unselectAll()
      }
    }
    window.addEventListener('keydown', this.handleEscKey)
  },
  unmounted () {
    // Clean up ESC key listener
    if (this.handleEscKey) {
      window.removeEventListener('keydown', this.handleEscKey)
    }
  },
  methods: {
    mapLevelKeyFn,
    // stops
    createStopHandler (node) {
      let newStopId = 0
      this.station.createStop(this.$apollo, node)
        .then((d) => {
          newStopId = d?.data?.stop_create?.id
          return this.refetch()
        })
        .then(() => {
          // Use nextTick to ensure Vue has updated after refetch
          return nextTick()
        })
        .then(() => {
          // Additional small delay to ensure map has updated
          setTimeout(() => {
            this.selectStop(newStopId)
          }, 150)
        })
        .catch(this.setError)
    },
    updateStopHandler (node) {
      this.station.updateStop(this.$apollo, node)
        .then(() => { return this.refetch() })
        .then(() => { this.selectStop(node.id) })
        .catch(this.setError)
    },
    deleteStopHandler (nodeId) {
      return this.station.deleteStop(this.$apollo, nodeId)
        .then(() => { return this.refetch() })
        .then(() => { this.selectStop(null) })
        .catch(this.setError)
    },
    moveStopSave (stopid, e) {
      if (stopid === null) {
        return
      }
      const stop = this.station.getStop(stopid) // copy
      if (!stop) {
        return
      }
      stop.setCoords(e.lng, e.lat)
      this.updateStopHandler(stop)
    },
    // node associations
    deleteAssociationHandler (node) {
      this.station.deleteAssociation(this.$apollo, node)
        .then(() => { return this.refetch() })
        .then(() => { this.selectStop(null) })
        .catch(this.setError)
    },
    // pathways
    newPathway () {
      return new Pathway({
        // other fields will be defaults
        from_stop_id: this.selectedSource.id,
        to_stop_id: this.selectedStop.id,
        from_stop: this.selectedSource,
        to_stop: this.selectedStop,
        pathway_id: `${this.selectedSource.id}-${this.selectedStop.id}-${Date.now()}`
      }).setDefaults()
    },
    createPathwayHandler (pw) {
      this.station.createPathway(this.$apollo, pw)
        .then(() => { return this.refetch() })
        .then(() => { this.selectPathway(null) })
        .catch(this.setError) // todo: select
    },
    updatePathwayHandler (pw) {
      this.station.updatePathway(this.$apollo, pw)
        .then(() => { return this.refetch() })
        .then(() => { this.selectPathway(null) })
        .catch(this.setError)
    },
    deletePathwayHandler (pw) {
      this.selectPathway(null)
      this.station.deletePathway(this.$apollo, pw)
        .then(() => { return this.refetch() })
        .then(() => { this.selectPathway(null) })
        .catch(this.setError)
    },
    // select tools
    selectStop (stopId) {
      console.log('selectStop: start', stopId)
      if (stopId === null) {
        this.selectedStops = []
        this.selectMode = 'select'
        console.log('selectStop: no stopid')
        return
      }
      const cur = this.station.getStop(stopId)
      console.log('selectStop: cur stop', cur)
      const prev = this.selectedStops.length > 0 ? this.selectedStops[this.selectedStops.length - 1] : null
      if (!cur) {
        console.warn('selectStop: stop not found', stopId)
        return
      }
      // find-route is sticky on first selected stop
      if (prev && this.selectMode === 'find-route') {
        if (prev === cur) {
          console.log('selectStop: same stop, unselecting')
          this.selectedStops = []
          return
        }
        this.selectedStops = [this.selectedStops[0], cur]
        console.log('selectStop: find-route set selectedStops to', this.selectedStops)
        return
      }
      //
      this.selectedPathways = []
      if (prev) {
        if (prev === cur) {
          this.selectedStops = []
          this.selectMode = 'select'
        } else {
          this.selectedStops = [prev, cur]
          this.selectMode = 'add-pathway'
        }
      } else {
        this.selectedStops = [cur]
        this.selectMode = 'edit-node'
      }
      console.log('selectStop: set selectedStops to', this.selectedStops, 'and selectMode to', this.selectMode)
    },
    selectPath (fromId, toId) {
      this.selectMode = 'find-route'
      this.selectedStops = [this.station.getStop(fromId), this.station.getStop(toId)]
    },
    selectPathway (pwid) {
      if (pwid === null) {
        this.selectedPathways = []
        this.selectMode = 'select'
        return
      }
      const cur = this.pathwayIndex[pwid]
      const prev = this.selectedPathways.length > 0 ? this.selectedPathways[this.selectedPathways.length - 1] : null
      this.selectedStops = []
      if (prev === cur) {
        this.selectedPathways = []
        this.selectMode = 'select'
      } else {
        this.selectedPathways = [cur]
        this.selectMode = 'edit-pathway'
      }
    },
    selectPoint (ll) {
      this.selectedPoint = ll
      if (this.selectMode === 'add-node') {
        const stop = new Stop({
          geometry: {
            type: 'Point',
            coordinates: [ll.lng, ll.lat]
          },
          level: { id: this.selectedLevel }
        }).setDefaults()
        this.createStopHandler(stop)
      }
    },
    // Helper method to filter and notify
    applyFilter (filterFn, filterLabel, notFoundMessage, target = 'stops') {
      const results = target === 'stops'
        ? this.station.stops.filter(filterFn)
        : this.station.pathways.filter(filterFn)

      if (target === 'stops') {
        this.selectedStops = results
      } else {
        this.selectedPathways = results
      }

      this.lastFilterApplied = filterLabel
      this.selectMode = 'select'

      if (results.length === 0) {
        this.showToast(notFoundMessage)
      }
    },
    selectStopsWithAssociations () {
      this.applyFilter(
        s => s.external_reference?.target_stop_id,
        'Stops with associations',
        'No stops with associations found'
      )
    },
    selectStopsPlatformsWithoutAssociations () {
      this.applyFilter(
        s => s.location_type === 0 && !s.external_reference,
        'Platforms without associations',
        'No platforms without associations found'
      )
    },
    selectStopsEntrancesWithoutAssociations () {
      this.applyFilter(
        s => s.location_type === 2 && !s.external_reference,
        'Entrances without associations',
        'No entrances without associations found'
      )
    },
    selectStopsWithPairedPathways () {
      const pairedPathways = new Map()
      this.applyFilter(
        (s) => {
          const pwKeys = []
          for (const pw of s.pathways_from_stop) {
            pwKeys.push(`${pw.from_stop.id}-${pw.to_stop.id}`)
          }
          for (const pw of s.pathways_to_stop) {
            pwKeys.push(`${pw.to_stop.id}-${pw.from_stop.id}`)
          }
          let matched = false
          for (const pwkey of pwKeys) {
            if (pairedPathways.has(pwkey)) {
              matched = true
            }
            pairedPathways.set(pwkey, true)
          }
          return matched
        },
        'Stops with paired pathways',
        'No stops with paired pathways found'
      )
    },
    selectLocationTypes (stype) {
      this.applyFilter(
        s => s.location_type === stype,
        `Stops: ${this.LocationTypes.get(stype)}`,
        `No ${this.LocationTypes.get(stype)} stops found`
      )
    },
    selectPathwayModes (stype) {
      this.applyFilter(
        s => s.pathway_mode === stype,
        `Pathways: ${this.PathwayModes.get(stype)}`,
        `No ${this.PathwayModes.get(stype)} pathways found`,
        'pathways'
      )
    },
    selectPathwaysWithPairs () {
      const pwPairs = new Map()
      this.applyFilter(
        (s) => {
          const pwKeys = [
            `${s.from_stop.id}-${s.to_stop.id}`,
            `${s.to_stop.id}-${s.from_stop.id}`
          ]
          let matched = false
          for (const pwkey of pwKeys) {
            if (pwPairs.has(pwkey)) {
              matched = true
            }
            pwPairs.set(pwkey, true)
          }
          return matched
        },
        'Pathways with pairs',
        'No pathways with pairs found',
        'pathways'
      )
    },
    selectPathwaysOneway () {
      this.applyFilter(
        s => !s.is_bidirectional,
        'One-directional pathways',
        'No one-directional pathways found',
        'pathways'
      )
    },
    selectPathwaysBidirectional () {
      this.applyFilter(
        s => s.is_bidirectional,
        'Bi-directional pathways',
        'No bi-directional pathways found',
        'pathways'
      )
    },
    unselectAll () {
      this.selectedStops = []
      this.selectedPathways = []
      this.selectedPoint = null
      this.lastFilterApplied = ''
      this.selectMode = 'select'
    },
    downloadGeojson () {
      const allFeatures = []
      allFeatures.push(...this.station.levels.map((s) => {
        return {
          type: 'Feature',
          id: s.id,
          properties: {
            id: s.id,
            level_id: s.level_id,
            level_name: s.level_name,
            level_index: s.level_index
          },
          geometry: s.geometry
        }
      }))
      allFeatures.push(...this.station.pathways.map((s) => {
        return {
          type: 'Feature',
          id: s.id,
          properties: {
            id: s.id,
            pathway_id: s.pathway_id,
            pathway_mode: s.pathway_mode,
            signposted_as: s.signposted_as,
            reverse_signposted_as: s.reverse_signposted_as,
            stair_count: s.stair_count,
            is_bidirectional: s.is_bidirectional,
            length: s.length,
            min_slope: s.min_slope,
            max_slope: s.max_slope,
            from_id: s.from_stop.id,
            from_stop_id: String(s.from_stop.stop_id),
            from_stop_name: s.from_stop.stop_name,
            to_id: s.to_stop.id,
            to_stop_id: String(s.to_stop.stop_id),
            to_stop_name: s.to_stop.stop_name,
            from_level_id: s.from_stop.level?.id,
            from_level_name: s.from_stop.level?.id,
            to_level_id: s.to_stop.level?.id,
            to_level_name: s.to_stop.level?.id
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              s.from_stop.geometry.coordinates,
              s.to_stop.geometry.coordinates
            ]
          }
        }
      }))
      allFeatures.push(...this.station.stops.map((s) => {
        return {
          type: 'Feature',
          id: s.id,
          properties: {
            id: s.id,
            stop_name: s.stop_name,
            stop_id: String(s.stop_id),
            stop_code: s.stop_code,
            stop_desc: s.stop_desc,
            location_type: s.location_type,
            level_id: s.level?.id,
            level_index: s.level?.level_index
          },
          geometry: s.geometry
        }
      }))
      const data = JSON.stringify({ type: 'FeatureCollection', features: allFeatures })
      const blob = new Blob([data], { type: 'text/json' })
      const e = document.createEvent('MouseEvents')
      const a = document.createElement('a')
      a.download = 'station.geojson'
      a.href = window.URL.createObjectURL(blob)
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      a.dispatchEvent(e)
    }
  }
}
</script>

  <style>
  .help li {
    margin-bottom:10px;
  }

   .station-pathways-container {
     height: calc(100vh - 80px);
     display: flex;
     flex-direction: column;
   }

   .pathways-columns {
     flex: 1;
     height: 100%;
   }

   .tl-editor-info {
     width: 540px;
     height: 100%;
     overflow-y: auto;
     padding-right: 0.5rem;
   }
   .station-editor-panel {
     margin-bottom: 0.75rem;
   }
   .station-editor-panel .panel-heading {
     padding: 0.5em 0.75em;
     font-size: 0.875rem;
   }
   .station-editor-panel .panel-block {
     padding: 0.75rem;
   }
   .station-editor-panel .buttons.has-addons {
     display: flex;
     width: 100%;
   }
   .station-editor-panel .buttons.has-addons .button {
     flex: 1;
   }
   .station-editor-panel .columns.is-mobile {
     margin-bottom: 0;
   }
   .station-editor-panel .columns.is-mobile .column {
     padding-top: 0;
     padding-bottom: 0;
   }

   /* Ensure layout fits in viewport */
   .pathways-columns {
     margin-top: 0;
     margin-bottom: 0;
     display: flex;
     align-items: stretch;
   }

   .pathways-columns .column.is-narrow {
     display: flex;
     flex-direction: column;
   }

   .pathways-columns .column.is-narrow .block {
     flex: 1;
     display: flex;
     flex-direction: column;
   }

   /* Make map container fill available height */
   .pathways-columns .column:not(.is-narrow) {
     display: flex;
     flex-direction: column;
     flex: 1;
   }

   .pathways-columns .column:not(.is-narrow) > * {
     flex: 1;
     height: 100%;
   }

   /* Collapse trigger styling */
   .collapse-trigger-field {
     margin-bottom: 0.5rem;
   }

   .collapse-trigger-label {
     display: flex;
     align-items: center;
     gap: 0.25rem;
     cursor: pointer;
     margin-bottom: 0 !important;
   }

   .collapse-trigger-label:hover {
     color: #3273dc;
   }

   /* Legend styling */
   .legend-item {
     margin-bottom: 0.25rem;
   }

   .circle-indicator::before {
     content: "⓪ ";
     font-size: 1.2em;
   }

   .blue-rectangle::before {
     content: "🟦 ";
   }

   .red-rectangle::before {
     content: "🟥 ";
   }

   .purple-rectangle::before {
     content: "🟪 ";
   }
  </style>
