<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Station Stops">
        Station Stops: {{ stationName }}
      </tl-title>
    </slot>
    <tl-apps-stations-station-mode-tabs
      :station="station"
      :feed-key="feedKey"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :stop-associations-enabled="stopAssociationsEnabled"
    />

    <div class="columns">
      <div class="column is-narrow">
        <div class="editor-info">
          <t-card class="card">
            <template #trigger>
              Node
            </template>
            <div v-if="selectedStop" :key="selectedStop.id">
              <template v-if="selectedStop.id === station.id">
                This is the station.
              </template>
              <template v-else-if="selectedStop.parent?.id === station.id">
                This stop is already associated with the station. Use the pathways editor.
              </template>
              <div v-else-if="selectedStop">
                <t-field label="Feed ID">
                  <t-input v-model="selectedStop.feed_version.feed.onestop_id" :disabled="true" />
                </t-field>
                <t-field label="Stop ID">
                  <t-input v-model="selectedStop.stop_id" :disabled="true" />
                </t-field>
                <t-field label="Name">
                  <t-input v-model="selectedStop.stop_name" :disabled="true" />
                </t-field>

                <t-field label="Location Type">
                  <t-select :model-value="String(selectedStop.location_type || '')" :disabled="true">
                    <option v-for="[type, label] of LocationTypes.entries()" :key="type" :value="type">
                      {{ label }}
                    </option>
                  </t-select>
                </t-field>

                <t-field label="Import to Level">
                  <t-select :model-value="String(selectedStop.level?.id || '')" @update:model-value="(val: any) => { if (selectedStop && selectedStop.level) selectedStop.level.id = Number(val) }">
                    <option v-for="level of station.levels" :key="level.id" :value="level.id">
                      {{ level.level_name }}
                    </option>
                  </t-select>
                </t-field>
                <t-field v-if="selectedStop.route_stops.length > 0" label="Routes">
                  <ul>
                    <li v-for="rt of selectedStop.route_stops" :key="rt.route?.id">
                      {{ rt.route?.agency?.agency_id }}: {{ rt.route?.route_short_name || rt.route?.route_long_name }}
                    </li>
                  </ul>
                </t-field>
                <span class="button is-primary" @click="importStopHandler(selectedStop)">
                  Import Node
                </span>
              </div>
            </div>
            <div v-else>
              Click to select a stop
            </div>
          </t-card>

          <br>
          <t-card>
            <template #trigger>
              Help
            </template>
            <ul class="help">
              <li>Select a node to import into station</li>
              <li>You must select a level before importing</li>
              <li>Click the selected item again to unselect</li>
            </ul>
          </t-card>
        </div>
      </div>

      <div class="column">
        <t-field>
          <t-dropdown
            v-model="selectedLevels"
            :width="300"
            selectable
            multiple
            trigger-label="Levels"
          >
            <t-dropdown-item v-for="level of station.levels" :key="level.id" :value="level.id">
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
            </t-dropdown-item>
          </t-dropdown>

          <tl-apps-stations-basemap-control v-model="basemap" />

          <t-dropdown
            v-model="selectedSources"
            :width="300"
            multiple
            trigger-label="Sources"
          >
            <t-dropdown-item v-for="(sourceType, key) of SourceTypes" :key="sourceType" :value="key">
              <div class="media">
                {{ sourceType }}
              </div>
            </t-dropdown-item>
          </t-dropdown>

          <t-dropdown
            v-model="selectedLocationTypes"
            :width="300"
            trigger-label="Location Types"
            multiple
          >
            <t-dropdown-item v-for="[key, locationType] of LocationTypes.entries()" :key="locationType" :value="key.toString()">
              <div class="media">
                {{ locationType }}
              </div>
            </t-dropdown-item>
          </t-dropdown>

          <t-dropdown
            v-model="selectedAgencies"
            :width="300"
            multiple
            trigger-label="Agencies"
          >
            <t-dropdown-item v-for="(agency, key) of agencies" :key="key" :value="key">
              <div class="media">
                {{ key }} {{ agency }}
              </div>
            </t-dropdown-item>
          </t-dropdown>
        </t-field>
        <tl-pathway-map
          :editable="true"
          :center="station.geometry?.coordinates as [number, number]"
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

<script lang="ts">
import { defineComponent } from 'vue'
import { navigateTo } from '#imports'
import { gql } from 'graphql-tag'
import { Stop } from '../station'
import StationMixin from './station-mixin.vue'
import { LocationTypes } from '../basemaps'

function intersection (setA: Set<string>, setB: Iterable<string>): Set<string> {
  const _intersection: Set<string> = new Set()
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

export default defineComponent({
  mixins: [StationMixin],
  props: {
    client: { type: String, default: 'default' }
  },
  apollo: {
    nearbyStopsQuery: {
      client: 'stationEditor',
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
      update (data: any) {
        this.nearbyStops = (data.stops || []).map((s: any) => { return new Stop(s) })
      }
    }
  },
  data () {
    return {
      nearbyStops: [] as Stop[],
      selectMode: 'select',
      basemap: 'carto',
      LocationTypes,
      selectedLocationTypes: ['0', '2'], // must be stringy
      selectedSources: ['nearby', 'station'],
      SourceTypes: {
        station: 'Associated Stops',
        nearby: 'Unassociated Stops'
      }
    }
  },
  computed: {
    filteredStops () {
      // Get nearby stops that are NOT associated with the station and NOT in the excluded feed list.
      // Also apply agency selection.
      if (!this.station) {
        return []
      }
      if (!this.selectedSources.includes('nearby')) {
        return []
      }

      // Exclude specified feeds and stops that are already associated with the station
      const station = this.station
      const excludeFeeds = new Set(['RG', 'historic', 'mtc'])
      const excludeStops = new Set()
      const associatedStops = station.stops.filter((s) => {
        return s.external_reference?.target_active_stop
      })
      for (const stop of associatedStops) {
        const key = `${stop.external_reference?.target_feed_onestop_id}:${stop.external_reference?.target_stop_id}`
        excludeStops.add(key)
      }

      const filteredStops = this.nearbyStops.filter((stop) => {
        // Exclude stops that are already imported into the station
        const key = `${stop.feed_version?.feed?.onestop_id}:${stop.stop_id}`
        if (excludeStops.has(key)) {
          return false
        }
        // Exclude stops that are already associated with the station
        if (stop.parent?.id === station.id) {
          return false
        }
        // Exclude stops that are in the same feed version as the station
        if (stop.feed_version?.id === station.stop?.feed_version?.id) {
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

      const check = new Set(this.selectedAgencies)
      return filteredStops.filter((stop) => {
        if (stop.location_type === 1) {
          let rss = stop.route_stops || []
          if (stop.external_reference && stop.external_reference.target_active_stop && stop.external_reference.target_active_stop.route_stops) {
            rss = stop.external_reference.target_active_stop.route_stops
          }
          const stopAgencies: string[] = []
          for (const rs of rss) {
            if (rs.route?.agency?.agency_id) {
              stopAgencies.push(rs.route.agency.agency_id)
            }
          }
          if (intersection(check, stopAgencies).size === 0) {
            return false
          }
        }
        return this.selectedLocationTypes.includes(stop.location_type?.toString() || '')
      })
    },
    stationFiltered () {
      if (!this.station) {
        return { id: 0, geometry: null, levels: [], pathways: [], stops: [] }
      }
      const station = this.station
      return {
        id: station.id,
        geometry: station.geometry,
        levels: station.levels,
        pathways: [],
        stops: !this.selectedSources.includes('station')
          ? []
          : station.stops.filter((s) => {
              const target = s.external_reference?.target_active_stop
              return target && this.selectedLocationTypes.includes(target.location_type?.toString() || '')
            })
      }
    },
    selectedAgencies: {
      // We need to override selectedAgencies to incorporate nearby stops
      get () {
        if (this.selectedAgenciesShadow != null) {
          return this.selectedAgenciesShadow
        }
        const allAgencies = new Map()
        for (const stop of this.station?.stops || []) {
          for (const rs of stop.route_stops || []) {
            if (rs.route?.agency?.agency_id) {
              allAgencies.set(rs.route.agency.agency_id, true)
            }
          }
        }
        for (const stop of this.nearbyStops || []) {
          for (const rs of stop.route_stops || []) {
            if (rs.route?.agency?.agency_id) {
              allAgencies.set(rs.route.agency.agency_id, true)
            }
          }
        }
        return Array.from(allAgencies.keys())
      },
      set (v: any) {
        this.selectedAgenciesShadow = v || []
      }
    },
    agencies (): Record<string, string> {
      const ret: Record<string, string> = {}
      if (!this.station) return ret
      for (const stop of this.station.stops) {
        if (stop.external_reference && stop.external_reference.target_active_stop && stop.external_reference.target_active_stop.route_stops) {
          for (const rs of stop.external_reference.target_active_stop.route_stops || []) {
            if (rs.route?.agency?.agency_id) {
              ret[rs.route.agency.agency_id] = rs.route.agency.agency_name || ''
            }
          }
        }
      }
      for (const stop of this.nearbyStops || []) {
        for (const rs of stop.route_stops || []) {
          if (rs.route?.agency?.agency_id) {
            ret[rs.route.agency.agency_id] = rs.route.agency.agency_name || ''
          }
        }
      }
      return ret
    },
    selectedStops (): Stop[] {
      if (this.selectedStop) { return [this.selectedStop] }
      return []
    },
    selectedStop (): Stop | null {
      if (!this.station) {
        return null
      }
      const s = this.$route.query.selectedStop
      if (!s || Array.isArray(s)) {
        return null
      }
      const si = Number.parseInt(s as string)
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
  methods: {
    importStopHandler (ent: Stop) {
      if (!this.station) return
      this.station.importStop((this.$apollo as any), ent)
        .then(() => { return this.refetch() })
        .then((data: any) => { this.selectStop(data.id) })
        .catch(this.setError)
    },
    selectStop (stopid: number) {
      navigateTo({
        query: { ...this.$route.query, selectedStop: stopid }
      })
    }
  }
})
</script>

  <style scoped>
  .help li {
    margin-bottom:10px;
  }
.editor-info {
  width:460px
}
</style>
