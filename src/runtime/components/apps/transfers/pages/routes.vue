<template>
  <div v-if="props.stationArea">
    <tl-apps-transfers-breadcrumbs
      :station-area="props.stationArea"
    />

    <tl-title :title="`${props.stationArea.properties.name}: Routes`" />

    <tl-apps-transfers-scenario-with-controls
      :station-area="props.stationArea"
      :feed-versions-options="props.feedVersionsOptions"
    >
      <template #default="{ scenario, scenarioResult }">
        <t-notification v-if="getRoutesWithServiceRows(scenario, scenarioResult).length === 0" variant="warning">
          <span>No incoming trips match the current location and filters.</span>
        </t-notification>
        <div v-else>
          <tl-apps-transfers-data-grid
            :grid-data="getRoutesWithServiceRows(scenario, scenarioResult)"
            :columns="routesGridColumns"
            default-sort-key="first_departure"
          />
        </div>
      </template>
    </tl-apps-transfers-scenario-with-controls>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '#app'
import { windowToSeconds } from '../../../../lib/time-format'
import type { StationHub } from '../types'
import type { UseFeedVersionsOptions } from '../useFeedVersions'
import { departureStats } from '../../../../lib/departure-stats'

interface Props {
  stationArea: StationHub
  feedVersionsOptions?: UseFeedVersionsOptions
}

const props = defineProps<Props>()
const route = useRoute()

const routesGridColumns = [
  { key: 'agency_name', text: 'Agency' },
  {
    key: 'route_long_name',
    prefix: 'route_short_name',
    text: 'Route'
  },
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
  {
    key: 'first_departure',
    text: 'First departure',
    transform: 'secondsToString'
  },
  {
    key: 'last_departure',
    text: 'Last departure',
    transform: 'secondsToString'
  },
  { key: 'trip_count', text: 'Trips' },
  { key: 'p50', text: 'Headway', transform: 'secondsToDuration' },
  // FIXME: Disabled because tree state is not correctly set
  // {
  //   key: 'link_to_tranfers_from',
  //   link: 'link_to_tranfers_from',
  //   link_text: 'View Transfers from Route'
  // },
  // {
  //   key: 'link_to_tranfers_to',
  //   link: 'link_to_tranfers_to',
  //   link_text: 'View Transfers to Route'
  // }
]

function getRouteStopDepartures (scenario: any, scenarioResult: any) {
  if (!scenario || !scenarioResult) return {}

  const tw = windowToSeconds(scenario.timeOfDay)
  const serviceStartTime = tw[0]
  const serviceEndTime = tw[1]
  const departuresToD = scenarioResult.outgoingDepartures.filter((d: any) => {
    return d.departure_time >= serviceStartTime && d.departure_time < serviceEndTime
  })

  const deps: Record<number, Record<string, Record<number, any[]>>> = {}
  for (const d of departuresToD) {
    const sid = d.stop.id
    const rid = d.trip.route.id
    const did = d.trip.trip_headsign

    if (!sid || !rid || !did) continue

    deps[rid] = deps[rid] || {}
    deps[rid][did] = deps[rid][did] || {}
    deps[rid][did][sid] = deps[rid][did][sid] || []
    deps[rid][did][sid].push(d)
  }
  return deps
}

function getRoutesWithServiceRows (scenario: any, scenarioResult: any) {
  if (!scenario || !scenarioResult || !props.stationArea) return []

  const tw = windowToSeconds(scenario.timeOfDay)
  const serviceStartTime = tw[0]
  const serviceEndTime = tw[1]
  const routeIndex: Record<number, any> = {}

  for (const d of scenarioResult.outgoingDepartures) {
    routeIndex[d.trip.route.id] = d.trip.route
  }

  const ret: any[] = []
  const routeStopDepartures = getRouteStopDepartures(scenario, scenarioResult)
  for (const [rid, dids] of Object.entries(routeStopDepartures)) {
    const rt = routeIndex[Number(rid)]
    if (!rt) continue

    for (const [did, departures] of Object.entries(dids as any)) {
      const sortedByCount = Object.values(departures as any).sort((a: any, b: any) => {
        return a.length - b.length
      })
      if (sortedByCount.length === 0) continue

      const selectedStopDepartures = (sortedByCount[0] as any[]).map((s: any) => s.departure_time)
      const stats = departureStats(selectedStopDepartures, serviceStartTime, serviceEndTime)

      ret.push({
        agency_name: rt.agency.agency_name,
        route_short_name: rt.route_short_name,
        route_long_name: rt.route_long_name,
        trip_headsign: did,
        p50: stats.headway_median,
        first_departure: stats.first_departure_time,
        last_departure: stats.last_departure_time,
        trip_count: stats.departure_count,
        category: rt.route_attribute?.category,
        subcategory: rt.route_attribute?.subcategory,
        link_to_tranfers_from: {
          routeKey: 'apps-transfers-stationKey-transfers',
          params: {
            stationKey: props.stationArea.properties.id
          },
          query: {
            ...route.query,
            fromTripHeadsigns: `${rt.id}:${did}`
          }
        },
        link_to_tranfers_to: {
          routeKey: 'apps-transfers-stationKey-transfers',
          params: {
            stationKey: props.stationArea.properties.id
          },
          query: {
            ...route.query,
            toTripHeadsigns: `${rt.id}:${did}`
          }
        }
      })
    }
  }

  return ret.sort((a, b) => {
    const nameA = a.agency_name + a.route_short_name + a.route_long_name
    const nameB = b.agency_name + b.route_short_name + b.route_long_name
    if (nameA < nameB) return -1
    if (nameA > nameB) return 1
    return 0
  })
}
</script>
