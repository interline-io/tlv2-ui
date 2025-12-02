<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Station Pathways">
        Station Pathways: {{ stationName }}
      </tl-title>
    </slot>
    <tl-apps-stations-station-mode-tabs
      :station="station"
      :feed-key="feedKey"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :stop-associations-enabled="stopAssociationsEnabled"
    />

    <div v-if="ready" class="columns">
      <div class="column is-narrow">
        <div class="block tl-apps-stations-info">
          <t-field label="Station Validation Reports">
            <tl-apps-stations-station-validator
              :station="station"
              @select-path="selectPath"
              @select-stop="selectStop"
              @select-pathway="selectPathway"
            />
          </t-field>
          <!-- SELECT -->
          <t-card v-if="selectMode === 'select'">
            <template #trigger>
              Select
            </template>
            <div>
              <div class="mb-2">
                <p class="label">
                  {{ selectedStops.length }} stops selected
                  <t-button v-if="selectedStops.length > 0" class="is-pulled-right m-2" variant="primary is-small" outlined @click="unselectAll">
                    Unselect All
                  </t-button>
                </p>
                <t-field label="Select Stops">
                  <div class="buttons has-addons">
                    <a v-for="pwm of LocationTypes" :key="pwm[0]" class="button is-small" @click="selectLocationTypes(pwm[0])">{{ pwm[1] }}</a>
                  </div>
                </t-field><t-field>
                  <div class="buttons has-addons">
                    <a class="button is-small" @click="selectStopsWithAssociations()">With associations</a>
                    <a class="button is-small" @click="selectStopsPlatformsWithoutAssociations()">Platforms w/o assoc.</a>
                    <a class="button is-small" @click="selectStopsEntrancesWithoutAssociations()">Entrances w/o assoc.</a>
                  </div>
                  <div class="buttons has-addons">
                    <a class="button is-small" @click="selectStopsWithPairedPathways()">With paired pathways</a>
                  </div>
                </t-field>
              </div>
              <div class="mb-2">
                <p class="label">
                  {{ selectedPathways.length }} pathways selected
                  <t-button v-if="selectedPathways.length > 0" class="is-pulled-right m-2" variant="primary is-small" outlined @click="unselectAll">
                    Unselect All
                  </t-button>
                </p>
                <t-field label="Select Pathways">
                  <div class="buttons has-addons">
                    <a v-for="pwm of PathwayModes" :key="pwm[0]" class="button is-small" @click="selectPathwayModes(pwm[0])">{{ pwm[1] }}</a>
                  </div>
                  <div class="buttons has-addons">
                    <a class="button is-small" @click="selectPathwaysWithPairs()">With pairs</a>
                    <a class="button is-small" @click="selectPathwaysOneway()">One-directional</a>
                    <a class="button is-small" @click="selectPathwaysBidirectional()">Bi-directional</a>
                  </div>
                </t-field>
                <ul>
                  <li class="blue-rectangle">
                    blue pathways are on the same level
                  </li>
                  <li class="red-rectangle">
                    red pathways connect two separate levels
                  </li>
                  <li class="purple-rectangle">
                    purple lines show distance to associated stop
                  </li>
                </ul>
              </div>
            </div>
          </t-card>
          <t-card v-else-if="selectMode === 'add-pathway'">
            <template #trigger>
              Add Pathway
            </template>
            <div>
              <tl-apps-stations-pathway-editor
                :station="station"
                :value="newPathway()"
                @select-stop="selectStop"
                @create="createPathwayHandler"
              />
            </div>
          </t-card>
          <template v-if="selectMode === 'edit-pathway'">
            <t-card v-for="spw of selectedPathways" :key="spw.id">
              <template #trigger>
                Edit Pathway
              </template>
              <tl-apps-stations-mode-switch
                :params="{
                  feedKey: feedKey,
                  feedVersionKey: feedVersionKey,
                  stationKey: stationKey,
                }"
                :query="{
                  selectedPathway: spw.id,
                }"
              />
              <tl-apps-stations-pathway-editor
                :station="station"
                :value="spw"
                @select-stop="selectStop"
                @delete="deletePathwayHandler"
                @update="updatePathwayHandler"
              />
            </t-card>
          </template>
          <template v-else-if="selectMode === 'edit-node'">
            <t-card v-for="ss of selectedStops" :key="ss.id" class="card">
              <template #trigger>
                Edit Node
                <t-button v-if="selectedStops.length > 0 || selectedPathways.length > 0" class="is-pulled-right m-2" variant="primary is-small" outlined @click="unselectAll">
                  Unselect
                </t-button>
              </template>
              <tl-apps-stations-mode-switch
                :params="{
                  feedKey: feedKey,
                  feedVersionKey: feedVersionKey,
                  stationKey: stationKey,
                }"
                :query="{
                  selectedStop: ss.id,
                }"
              />
              <tl-apps-stations-stop-editor
                :station="station"
                :value="ss"
                :stop-associations-enabled="stopAssociationsEnabled"
                @delete="deleteStopHandler"
                @update="updateStopHandler"
                @delete-association="deleteAssociationHandler"
                @select-pathway="selectPathway"
              />
            </t-card>
          </template>
          <template v-else-if="selectMode === 'add-node'">
            <t-card v-if="selectMode === 'add-node'">
              <template #trigger>
                Add Node
              </template>
              <t-field label="Level">
                <t-dropdown
                  v-model="selectedLevel"
                  selectable
                  aria-role="list"
                  :trigger-label="levelIndex[selectedLevel] ? levelIndex[selectedLevel].level_name : 'None'"
                >
                  <t-dropdown-item v-for="level of station.levels" :key="level.id" :value="level.id" aria-role="listitem">
                    <h3>{{ level.level_name }}</h3>
                    <small> {{ level.stops.length }} nodes</small>
                  </t-dropdown-item>
                </t-dropdown>
              </t-field>
            </t-card>
          </template>
          <template v-else-if="selectMode === 'find-route'">
            <t-card v-if="selectedStops.length > 1">
              <template #trigger>
                Find Route
              </template>
              <tl-apps-stations-path-viewer :path="selectedPath" />
            </t-card>
          </template>

          <br>
        </div>
      </div>

      <div class="column">
        <t-field grouped>
          <t-field>
            <t-dropdown
              v-model="selectedLevels"
              :width="300"
              aria-role="list"
              trigger-label="Levels"
              multiple
              selectable
            >
              <t-dropdown-item v-for="level of sortedStationLevels" :key="level.id" :value="mapLevelKeyFn(level)" aria-role="listitem">
                <div class="media">
                  <div class="media-left">
                    {{ level.level_index == null ? '&nbsp;&nbsp;&nbsp;' : level.level_index }}
                  </div>
                  <div class="media-content">
                    <h3>{{ level.level_name }}</h3>
                    <small>{{ level.stops.length }} nodes </small>
                  </div>
                </div>
              </t-dropdown-item>
            </t-dropdown>
          </t-field>
          <t-field>
            <tl-apps-stations-basemap-control v-model="basemap" />
          </t-field>
          <t-field>
            <t-button icon-left="download" @click="downloadGeojson">
              GeoJSON
            </t-button>
          </t-field>
          <t-field>
            <t-radio
              v-model="selectMode"
              native-value="select"
            >
              <span>Select</span>
            </t-radio>
            <t-radio
              v-model="selectMode"
              :disabled="!(selectedStop && selectedSource)"
              native-value="add-pathway"
            >
              <span>Add Pathway</span>
            </t-radio>
            <t-radio
              v-model="selectMode"
              native-value="find-route"
            >
              <span>Find Route</span>
            </t-radio>
            <t-radio
              v-model="selectMode"
              native-value="add-node"
            >
              Add Node
            </t-radio>
          </t-field>
        </t-field>

        <tl-apps-stations-pathway-map
          :center="station.geometry.coordinates"
          :station="station"
          :basemap="basemap"
          :selected-stops="selectedStops"
          :selected-pathways="selectMode === 'find-route' && selectedPath ? selectedPath.map((s) => { return s.pathway }) : selectedPathways"
          :selected-levels="selectedLevels"
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
import { PathwayModes, LocationTypes } from '../basemaps'
import { Stop, Pathway, mapLevelKeyFn } from '../station'
import StationMixin from './station-mixin'

export default {
  mixins: [StationMixin],
  layout: 'wide',
  query: ['selectedStop', 'selectedPathway'],
  data () {
    return {
      id: undefined,
      selectMode: 'select',
      selectedPoint: null,
      selectedStops: [],
      selectedPathways: [],
      openStationValidator: false,
      basemap: 'carto',
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
          // NextTick does not seem to be sufficient here, so we use setTimeout
          setTimeout(() => { this.selectStop(newStopId) }, 100)
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
    selectStopsWithAssociations () {
      this.selectedStops = this.station.stops.filter((s) => { return s.external_reference?.target_stop_id })
      this.selectMode = 'select'
    },
    selectStopsPlatformsWithoutAssociations () {
      this.selectedStops = this.station.stops.filter((s) => { return s.location_type === 0 && !s.external_reference })
      this.selectMode = 'select'
    },
    selectStopsEntrancesWithoutAssociations () {
      this.selectedStops = this.station.stops.filter((s) => { return s.location_type === 2 && !s.external_reference })
      this.selectMode = 'select'
    },
    selectStopsWithPairedPathways () {
      const pairedPathways = new Map()
      this.selectedStops = this.station.stops.filter((s) => {
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
      })
      this.selectMode = 'select'
    },
    selectLocationTypes (stype) {
      this.selectedStops = this.station.stops.filter((s) => { return s.location_type === stype })
    },
    selectPathwayModes (stype) {
      this.selectedPathways = this.station.pathways.filter((s) => { return s.pathway_mode === stype })
    },
    selectPathwaysWithPairs () {
      const pwPairs = new Map()
      this.selectedPathways = this.station.pathways.filter((s) => {
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
      })
      this.selectMode = 'select'
    },
    selectPathwaysOneway () {
      this.selectedPathways = this.station.pathways.filter((s) => { return !s.is_bidirectional })
    },
    selectPathwaysBidirectional () {
      this.selectedPathways = this.station.pathways.filter((s) => { return s.is_bidirectional })
    },
    unselectAll () {
      this.selectedStops = []
      this.selectedPathways = []
      this.selectedPoint = null
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

  <style scoped>
  .help li {
    margin-bottom:10px;
  }
  .blue-rectangle::before {
    content: "🟦 ";
  }
  .red-rectangle::before {
    content: "🟥 "
  }
  .purple-rectangle::before {
    content: "🟪 "
  }
  .tl-apps-stations-info {
    width: 540px;
  }
  </style>
