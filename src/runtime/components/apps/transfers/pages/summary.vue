<template>
  <div v-if="props.stationArea">
    <tl-apps-transfers-breadcrumbs
      :station-area="props.stationArea"
    />

    <tl-title :title="`${props.stationArea.properties.name}: Transfers – Summary`" />

    <tl-apps-transfers-scenario-with-controls
      :station-area="props.stationArea"
      :feed-versions-options="props.feedVersionsOptions"
      :show-transfer-controls="true"
      :show-trip-controls="true"
    >
      <template #default="{ scenario, scenarioResult }">
        <t-notification v-if="scenarioResult && scenarioResult.transferGroups.length === 0" variant="warning">
          <span>No incoming trips match the current location and filters.</span>
        </t-notification>
        <div v-else-if="scenarioResult && scenario">
          <t-notification :closeable="false">
            Displaying transfers for {{ scenarioResult.transferGroups.length }} incoming trips.
          </t-notification>

          <tl-apps-transfers-time-scoring-histogram :scenario="scenario as any" :transfer-groups="scenarioResult.transferGroups" />

          <tl-apps-transfers-data-grid
            :grid-data="getTransferSummaries(scenario, scenarioResult)"
            :columns="transfersGridColumns"
          />
        </div>
      </template>
    </tl-apps-transfers-scenario-with-controls>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '#app'
import type { StationHub } from '../types'
import type { UseFeedVersionsOptions } from '../useFeedVersions'

interface Props {
  stationArea: StationHub
  feedVersionsOptions?: UseFeedVersionsOptions
}

const props = defineProps<Props>()
const route = useRoute()

const transfersGridColumns = [
  { key: 'from_agency_name', text: 'Incoming Agency' },
  { key: 'from_route_name', text: 'Incoming Route' },
  { key: 'from_trip_headsign', text: 'Incoming Headsign' },
  { key: 'to_agency_name', text: 'Outgoing Agency' },
  { key: 'to_route_name', text: 'Outgoing Route' },
  { key: 'to_trip_headsign', text: 'Outgoing Headsign' },
  { key: 'trips_missed', text: '', cls: 'ttat-trip ttat-trip-missed' },
  { key: 'trips_close', text: '', cls: 'ttat-trip ttat-trip-close' },
  { key: 'trips_acceptable', text: '', cls: 'ttat-trip ttat-trip-acceptable' },
  {
    key: 'trips_unacceptable',
    text: '',
    cls: 'ttat-trip ttat-trip-unacceptable'
  },
  // {
  //   key: 'link_to_individual_transfers',
  //   link: 'link_to_individual_transfers',
  //   link_text: 'View Individual Transfers'
  // }
]

function getTransferSummaries (scenario: any, scenarioResult: any) {
  if (!scenarioResult || !props.stationArea) return []

  const tgroups: Record<string, any> = {}
  for (const tg of scenarioResult.transferGroups) {
    for (const t of tg.transfers) {
      const dkey = `${tg.agency_key} ${tg.route_key} ${tg.trip_headsign} - ${(t as any).agency_key} ${(t as any).route_key} - ${(t as any).trip_headsign}`
      if (!tgroups[dkey]) {
        tgroups[dkey] = {
          from_agency_id: tg.agency_id,
          from_agency_name: tg.agency_name,
          from_route_id: tg.route_id,
          from_route_name: tg.route_name,
          from_trip_headsign: tg.trip_headsign,
          to_agency_id: t.agency_id,
          to_agency_name: t.agency_name,
          to_route_id: t.route_id,
          to_route_name: t.route_name,
          to_trip_headsign: t.trip_headsign,
          trips_missed: 0,
          trips_close: 0,
          trips_acceptable: 0,
          trips_unacceptable: 0
        }
      }
      const r = tgroups[dkey]
      const j = t.buffer_time
      if (j < -300) {
        // maybe we count these in the future
      } else if (j < 0) {
        r.trips_missed += 1
      } else if (j < 360) {
        r.trips_close += 1
      } else if (j < 600) {
        r.trips_acceptable += 1
      } else if (j <= 1200) {
        r.trips_unacceptable += 1
      } else {
        // maybe we count these in the future
      }
      tgroups[dkey] = r
    }
  }
  const ret = Object.values(tgroups) as any[]
  for (const r of ret) {
    if (r.trips_missed + r.trips_close + r.trips_acceptable + r.trips_unacceptable > 0) {
      r.link_to_individual_transfers = {
        routeKey: 'apps-transfers-stationKey-transfers',
        params: { stationKey: props.stationArea.properties.id },
        query: {
          ...route.query,
          fromAgencyIds: '',
          fromRouteIds: '',
          fromTripHeadsigns: `${r.from_route_id}:${r.from_trip_headsign}`,
          toAgencyIds: '',
          toRouteIds: '',
          toTripHeadsigns: `${r.to_route_id}:${r.to_trip_headsign}`
        }
      }
    }
  }
  return Object.values(tgroups)
}
</script>
