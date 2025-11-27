<template>
  <div v-if="props.stationArea">
    <tl-apps-transfers-breadcrumbs
      :station-area="props.stationArea"
    />

    <tl-title :title="`${props.stationArea.properties.name}: Maps & Platforms`" />

    <tl-apps-transfers-scenario-with-controls
      :station-area="props.stationArea"
    >
      <template #default="{ scenario, scenarioResult, station }">
        <o-tabs :model-value="activeTab" @update:model-value="activeTab = $event ?? 1">
          <o-tab-item label="Platforms">
            <div id="map-wrap" class="mb-4">
              <tl-apps-transfers-platform-map
                :stops="getStopsWithService(scenario, scenarioResult, station)"
                :station-area="props.stationArea"
                :center="mapCenter"
                :zoom="16"
              />
            </div>

            <o-notification v-if="getTableData(scenario, scenarioResult, station).length === 0" variant="warning">
              <span>No trips match the current location and filters.</span>
            </o-notification>
            <div v-else>
              <tl-apps-transfers-data-grid
                :grid-data="getTableData(scenario, scenarioResult, station)"
                :columns="platformsGridColumns"
                default-sort-key="first_departure"
              />
            </div>
          </o-tab-item>
          <o-tab-item v-for="map in maps" :key="map.url" :label="map.name">
            <img :src="map.img" :alt="map.name">
            <div class="notification is-info">
              <strong>Alternative</strong>: Open as a
              <a :href="map.pdf" target="_blank">PDF file</a>.
            </div>
          </o-tab-item>
        </o-tabs>
      </template>
    </tl-apps-transfers-scenario-with-controls>
  </div>
</template>

<script setup lang="ts">
import centroid from '@turf/centroid'
import { ref, computed, watch } from 'vue'
import { windowToSeconds, secondsToString } from '../../../../lib/time-format'
import type { StationHub } from '../types'
import { departureStats } from '../../../../lib/departure-stats'
import { navigateTo, useRoute } from '#app'

interface Props {
  stationArea: StationHub
}

const props = defineProps<Props>()
const route = useRoute()

const activeTab = ref(Number(route.query.activeTab) || 1)

const platformsGridColumns = [
  { key: 'stop_name', text: 'Stop' },
  { key: 'agency_name', text: 'Agency' },
  { key: 'route_short_name', text: 'Route' },
  {
    key: 'category',
    text: 'Category',
    transform: 'category'
  },
  {
    key: 'subcategory',
    text: 'Sub-category',
    transform: 'subcategory'
  },
  { key: 'trip_headsign', text: 'Headsign' },
  { key: 'trip_count', text: 'Trips' },
  { key: 'p50', text: 'Headway', transform: 'secondsToDuration' },

  { key: 'first_departure_time', hide: true },
  { key: 'last_departure_time', hide: true },
  { key: 'first_departure_time_str', hide: true },
  { key: 'last_departure_time_str', hide: true },
  { key: 'departure_count', hide: true },
  { key: 'departures', hide: true },
  { key: 'headway_min', hide: true },
  { key: 'headway_max', hide: true },
  { key: 'headway_average', hide: true },
  { key: 'headway_median', hide: true },
  { key: 'headway_count', hide: true }
]

const mapCenter = computed((): [number, number] => {
  if (props.stationArea?.geometry) {
    return centroid(props.stationArea.geometry).geometry.coordinates as [number, number]
  }
  return [0.0, 0.0]
})

function getServiceStops (station: any) {
  if (!station) { return [] }
  return station.stops.filter((s: any) => { return s.location_type === 0 })
}

function getStopRouteDepartures (scenario: any, scenarioResult: any) {
  // Route Index
  const routeIndex: any = {}
  if (!scenarioResult) return {}

  for (const d of scenarioResult.outgoingDepartures) {
    routeIndex[d.trip.route.id] = d.trip.route
  }
  // Filter
  if (!scenario) return {}
  const tw = windowToSeconds(scenario.timeOfDay)
  const serviceStartTime = tw[0]
  const serviceEndTime = tw[1]
  const departuresToD = scenarioResult.outgoingDepartures.filter((d: any) => { return d.departure_time >= serviceStartTime && d.departure_time < serviceEndTime })
  //
  const deps: any = {}
  for (const d of departuresToD || []) {
    const sid = d.stop.id
    const rid = d.trip.route.id
    const did = d.trip.trip_headsign // d.trip.direction_id
    if (!sid || !rid || !did) continue
    const rt = routeIndex[rid]
    if (!rt) {
      continue
    }
    if (!deps[sid]) {
      deps[sid] = {}
    }
    if (!deps[sid][rid]) {
      deps[sid][rid] = {}
    }
    if (!deps[sid][rid][did]) {
      deps[sid][rid][did] = {
        direction_id: did,
        route_id: rt.id,
        route_short_name: rt.route_short_name,
        route_long_name: rt.route_long_name,
        category: rt.route_attribute?.category,
        subcategory: rt.route_attribute?.subcategory,
        agency_name: rt.agency.agency_name,
        departures: []
      }
    }
    deps[sid][rid][did].departures.push(d)
  }
  return deps
}

function getStopsWithService (scenario: any, scenarioResult: any, station: any) {
  const ret: any[] = []
  const serviceStops = getServiceStops(station)
  const stopRouteDepartures = getStopRouteDepartures(scenario, scenarioResult)
  for (const s of serviceStops) {
    if (!s.id) continue
    const a = stopRouteDepartures[s.id]
    if (!a || Object.keys(a).length === 0) { continue }
    ret.push({
      id: s.id,
      geometry: s.geometry,
      stop_name: s.stop_name,
      departures_by_route: a
    })
  }
  return ret
}

function getTableData (scenario: any, scenarioResult: any, station: any) {
  if (!scenario) return []
  const tw = windowToSeconds(scenario.timeOfDay)
  const serviceStartTime = tw[0]
  const serviceEndTime = tw[1]
  const stopGroups = []
  const serviceStops = getServiceStops(station)
  const stopRouteDepartures = getStopRouteDepartures(scenario, scenarioResult)
  for (const s of serviceStops) {
    if (!s.id) continue
    const deps = stopRouteDepartures[s.id]
    if (!deps) {
      continue
    }
    for (const droutes of Object.values(deps) as any[] || []) {
      for (const d of Object.values(droutes) as any[]) {
        const dstats = departureStats(d.departures.map((s: any) => { return s.departure_time }), serviceStartTime, serviceEndTime)
        let row = {
          id: s.id + ':' + d.route_id + ':' + d.departures[0].trip.trip_headsign,
          stop_name: s.stop_name,
          agency_name: d.agency_name,
          route_short_name: d.route_short_name,
          category: d.category,
          subcategory: d.subcategory,
          trip_headsign: d.departures[0].trip.trip_headsign,
          trip_count: d.departures.length,
          first_departure_time: dstats.first_departure_time,
          last_departure_time: dstats.last_departure_time,
          first_departure_time_str: secondsToString(dstats.first_departure_time),
          last_departure_time_str: secondsToString(dstats.last_departure_time),
          departure_count: dstats.departure_count,
          departures: dstats.departures
        }
        if (dstats.headway_median) {
          row = Object.assign(row, {
            p50: dstats.headway_median,
            headway_min: dstats.headway_min,
            headway_max: dstats.headway_max,
            headway_average: dstats.headway_average,
            headway_median: dstats.headway_median,
            headway_count: dstats.headway_count
          })
        }
        stopGroups.push(row)
      }
    }
  }
  return stopGroups.sort((a, b) => {
    const nameA = a.agency_name + a.stop_name + a.route_short_name
    const nameB = b.agency_name + b.stop_name + b.route_short_name
    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }
    // names must be equal
    return 0
  })
}

const maps = computed(() => {
  return props.stationArea?.properties?.maps || []
})

watch(activeTab, (newVal) => {
  navigateTo({ query: { ...route.query, activeTab: newVal } })
})
</script>

<style scoped>
#map-wrap {
  height: 400px;
  width: 100%;
}
#map {
  z-index:1;
}
table {
  margin: 0;
}
</style>
