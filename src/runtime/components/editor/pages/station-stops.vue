<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Station Stops">
        Station Stops: {{ stationName }}
      </tl-title>
    </slot>
    <tl-editor-station-mode-tabs
      :station="station"
      :feed-key="feedKey"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :stop-associations-enabled="stopAssociationsEnabled"
    />

    <div class="columns">
      <div class="column is-narrow">
        <div class="editor-info">
          <tl-msg-card class="card">
            <template #trigger>
              Node
            </template>
            <div v-if="selectedStop" :key="selectedStop">
              <template v-if="selectedStop.id === station.id">
                This is the station.
              </template>
              <template v-else-if="selectedStop.parent?.id === station.id">
                This stop is already associated with the station. Use the pathways editor.
              </template>
              <div v-else-if="selectedStop">
                <o-field label="Stop ID">
                  <o-input v-model="selectedStop.stop_id" :disabled="true" />
                </o-field>
                <o-field label="Name">
                  <o-input v-model="selectedStop.stop_name" :disabled="true" />
                </o-field>
                <o-field label="Import to Level">
                  <o-select v-model="selectedStop.level.id">
                    <option v-for="level of station.levels" :key="level.id" :value="level.id">
                      {{ level.level_name }}
                    </option>
                  </o-select>
                </o-field>
                <o-field label="Routes">
                  <ul>
                    <li v-for="rt of selectedStop.route_stops" :key="rt.route.id">
                      {{ rt.route.agency.agency_id }}: {{ rt.route.route_short_name || rt.route.route_long_name }}
                    </li>
                  </ul>
                </o-field>
                <span class="button is-primary" @click="importStopHandler(selectedStop)">
                  Import Node
                </span>
              </div>
            </div>
            <div v-else>
              Click to select a stop
            </div>
          </tl-msg-card>

          <br>
          <tl-msg-card>
            <template #trigger>
              Help
            </template>
            <ul class="help">
              <li>Select a node to import into station</li>
              <li>You must select a level before importing</li>
              <li>Click the selected item again to unselect</li>
            </ul>
          </tl-msg-card>
        </div>
      </div>

      <div class="column">
        <o-field>
          <o-dropdown
            v-model="selectedAgencies"
            :width="300"
            aria-role="list"
            multiple
          >
            <template #trigger>
              <button class="button" type="button">
                Agencies &nbsp;
                <o-icon icon="menu-down" />
              </button>
            </template>
            <o-dropdown-item v-for="(agency,key) of agencies" :key="key" :value="key" aria-role="listitem">
              <div class="media">
                {{ key }} {{ agency }}
              </div>
            </o-dropdown-item>
          </o-dropdown>
          <o-dropdown
            v-model="selectedLevels"
            class="ml-4"
            :width="300"
            aria-role="list"
            multiple
          >
            <template #trigger>
              <button class="button" type="button">
                Levels &nbsp;
                <o-icon icon="menu-down" />
              </button>
            </template>
            <o-dropdown-item v-for="level of station.levels" :key="level.id" :value="level.id" aria-role="listitem">
              <div class="media">
                <div class="media-left">
                  {{ level.level_index !== undefined ? level.level_index : ' ' }}
                </div>
                <div class="media-content">
                  <h3>
                    {{ level.level_name }}
                  </h3>
                  <small>{{ level.stops.length }} nodes </small>
                </div>
              </div>
            </o-dropdown-item>
          </o-dropdown>

          <tl-editor-basemap-control v-model="basemap" />
        </o-field>
        <tl-editor-pathway-map
          :center="station.geometry.coordinates"
          :other-stops="filteredStops"
          :basemap="basemap"
          :station="stationFiltered"
          :selected-stops="selectedStops"
          :selected-levels="selectedLevels"
          :selected-agencies="selectedAgencies"
          @select-stop="selectStop"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'
import { Stop, mapLevelKeyFn } from '../station'
import StationMixin from './station-mixin'
import { navigateTo } from '#imports'

function intersection (setA, setB) {
  const _intersection = new Set()
  for (const elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem)
    }
  }
  return _intersection
}

// TODO
const nearbyStopsQuery = gql`
  query nearbyStopsQuery($lon:Float!, $lat:Float!) {
    stops(
      limit: 1000,
      where: {near:{lon:$lon, lat:$lat, radius:1000}}
    ) {
      id
      stop_id
      stop_name
      geometry
      location_type
      level {
        id
      }
      feed_version {
        id
        feed {
          id
          onestop_id
        }
      }
      parent {
        id
      }
      route_stops {
        route {
          id
          route_short_name
          route_long_name
          agency {
            id
            agency_id
            agency_name
          }
        }
      }
      external_reference {
        id
        target_stop_id
        target_feed_onestop_id
        target_active_stop {
          id
          stop_id
          stop_name
          geometry
          route_stops {
            route {
              id
              route_short_name
              route_long_name
              agency {
                id
                agency_id
                agency_name
              }            
            }
          }
        }
      }
      feed_version {
        id
        feed {
          id
          onestop_id
        }
      }
    }
  }
  `

export default {
  mixins: [StationMixin],
  apollo: {
    nearbyStopsQuery: {
      client: 'transitland',
      query: nearbyStopsQuery,
      skip () { return !this.station }, // run after stations
      error (e) {
        this.error(e)
      },
      variables () {
        return {
          lon: this.station.geometry.coordinates[0],
          lat: this.station.geometry.coordinates[1]
        }
      },
      update (data) {
        this.nearbyStops = (data.stops || []).map((s) => { return new Stop(s) })
      }
    }
  },
  data () {
    return {
      nearbyStops: [],
      selectMode: 'select',
      selectedAgencies: [],
      selectedLevels: [],
      basemap: 'carto'
    }
  },
  computed: {
    filteredStops () {
      // Get nearby stops that are NOT associated with the station and NOT in the excluded feed list.
      // Also apply agency selection.
      if (!this.station) {
        return []
      }

      // Exclude specified feeds and stops that are already associated with the station
      const excludeFeeds = new Set(['RG', 'historic', 'mtc'])
      const excludeStops = new Set()
      const associatedStops = this.station.stops.filter((s) => {
        return s.external_reference?.target_active_stop
      })
      for (const stop of associatedStops) {
        const key = `${stop.external_reference.target_feed_onestop_id}:${stop.external_reference.target_stop_id}`
        excludeStops.add(key)
      }

      const filteredStops = this.nearbyStops.filter((stop) => {
        // Exclude stops that are already imported into the station
        const key = `${stop.feed_version?.feed?.onestop_id}:${stop.stop_id}`
        if (excludeStops.has(key)) {
          return false
        }
        // Exclude stops that are already associated with the station
        if (stop.parent?.id === this.station.id) {
          return false
        }
        // Exclude stops that are in the same feed version as the station
        if (stop.feed_version?.id === this.station.stop?.feed_version?.id) {
          return false
        }
        // Exclude stops that are in the excluded feeds
        if (stop.feed_version?.feed?.onestop_id && excludeFeeds.has(stop.feed_version.feed.onestop_id)) {
          return false
        }
        // Exclude stations
        if (stop.location_type === 1) {
          return false
        }
        return true
      })

      console.log('Filtered nearby stops:', filteredStops.length, 'of', this.nearbyStops.length)
      // if (this.selectedAgencies?.length > 0) {
      //   const check = new Set(this.selectedAgencies)
      //   filtered = filtered.filter((stop) => {
      //     let rss = stop.route_stops || []
      //     if (stop.external_reference && stop.external_reference.target_active_stop) {
      //       rss = stop.external_reference.target_active_stop.route_stops
      //     }
      //     const stopAgencies = []
      //     for (const rs of rss) {
      //       if (rs.route && rs.route.agency) {
      //         stopAgencies.push(rs.route.agency.agency_id)
      //       }
      //     }
      //     return intersection(check, stopAgencies).size > 0
      //   })
      // }
      // return [...filteredStops, ...associatedStops]
      return filteredStops
    },
    stationFiltered () {
      return {
        id: this.station.id,
        geometry: this.station.geometry,
        levels: this.station.levels,
        pathways: [],
        stops: []
      }
    },
    agencies () {
      const ret = {}
      for (const stop of this.station.stops) {
        if (stop.external_reference && stop.external_reference.target_active_stop && stop.external_reference.target_active_stop.route_stops) {
          for (const rs of stop.external_reference.target_active_stop.route_stops || []) {
            ret[rs.route.agency.agency_id] = rs.route.agency.agency_name
          }
        }
      }
      for (const stop of this.nearbyStops || []) {
        for (const rs of stop.route_stops || []) {
          ret[rs.route.agency.agency_id] = rs.route.agency.agency_name
        }
      }
      return ret
    },
    selectedStops () {
      if (this.selectedStop) { return [this.selectedStop] }
      return []
    },
    selectedStop () {
      if (!this.station) {
        return null
      }
      const s = this.$route.query.selectedStop
      if (!s) {
        return null
      }
      const si = parseInt(s)
      for (const stop of this.station.stops) {
        if (stop.id === si) {
          return stop
        }
      }
      for (const stop of this.nearbyStops) {
        if (stop.id === si) {
          return stop
        }
      }
      return null
    }
  },
  watch: {
    'station.levels' () {
      this.selectedLevels = this.station.levels.map(mapLevelKeyFn)
      this.selectedLevel = this.station.levels.length > 0 ? this.station.levels[0].id : null
      console.log('Station levels updated:', this.selectedLevels)
    },
  },
  methods: {
    importStopHandler (ent) {
      this.station.importStop(this.$apollo, ent)
        .then(() => { return this.refetch() })
        .then((data) => { this.selectStop(data.id) })
        .catch(this.setError)
    },
    selectStop (stopid) {
      navigateTo({
        query: { ...this.$route.query, selectedStop: stopid }
      })
    }
  }
}
</script>

  <style scoped>
  .help li {
    margin-bottom:10px;
  }
.editor-info {
  width:460px
}
</style>
