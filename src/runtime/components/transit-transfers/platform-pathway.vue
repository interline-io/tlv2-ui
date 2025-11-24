<template>
  <div>
    <o-notification variant="warning">
      For <strong>debugging</strong> purposes only. Directionality of a step may be reversed. Errors may be present.
    </o-notification>

    <tl-transit-transfers-platform-pathway-map
      :station="station"
      :center="mapCenter"
      :selected-pathways="selectedPathways"
      width="100%"
      height="600px"
      :zoom="17"
    />

    <br>

    <table class="table shaded" style="width:100%">
      <thead>
        <tr>
          <th>Type</th>
          <th>From</th>
          <th />
          <th>To</th>
          <th />
          <th>Distance</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pw of edgesWithIds" :key="pw.pathway.id">
          <td>
            <span style="width:24px"><img style="height:16px" :src="pathwayIcon(pw.pathway.pathway_mode!).url" :title="pathwayIcon(pw.pathway.pathway_mode!).label"></span>
          </td>
          <!-- TODO: Fix TypeScript errors with getStop -->
          <!-- <td>{{ LocationTypes.get(station?.getStop(pw.fromStopId)?.location_type) }}</td> -->
          <td>TBD</td>
          <!-- <td>{{ station?.getStop(pw.fromStopId)?.stop_name }}</td> -->
          <td>{{ pw.pathway.from_stop.stop_name }}</td>
          <!-- <td>{{ LocationTypes.get(station?.getStop(pw.toStopId)?.location_type) }}</td> -->
          <td>TBD</td>
          <!-- <td>{{ station?.getStop(pw.toStopId)?.stop_name }}</td> -->
          <td>{{ pw.pathway.to_stop.stop_name }}</td>
          <td>{{ pw.pathway.length!.toFixed(0) }} m</td>
          <td>{{ pw.cost.toFixed(0) }} s</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import centroid from '@turf/centroid'
import type { FeatureCollection, Feature, Point } from 'geojson'
import type { Station, Pathway } from './station'
import { PathwayModeIcons } from './pathway-icons'
import { computed } from 'vue'

interface Edge {
  pathway: Pathway
  cost: number
}

interface Trip {
  from_stop: { id: number }
  to_stop: { id: number }
  from_agency_name?: string
  from_route_name?: string
  agency_name?: string
  route_name?: string
}

interface Props {
  trip?: Trip | null
  station?: Station | null
  edges?: Edge[]
}

const props = withDefaults(defineProps<Props>(), {
  trip: null,
  station: null,
  edges: () => []
})

defineEmits<{
  close: []
}>()

const selectedPathways = computed(() => {
  return props.edges.map(s => s.pathway)
})

const edgesWithIds = computed(() => {
  return props.edges.map((edge) => {
    const fromStopId: number = edge.pathway.from_stop.id ?? 0
    const toStopId: number = edge.pathway.to_stop.id ?? 0
    return {
      ...edge,
      fromStopId,
      toStopId
    }
  })
})

const mapCenter = computed((): [number, number] => {
  if (!props.station || props.station.stops.length === 0) {
    return [0, 0]
  }
  const features: Feature<Point>[] = []
  for (const stop of props.station.stops) {
    features.push({ type: 'Feature', properties: {}, geometry: stop.geometry! })
  }
  const c = centroid({ type: 'FeatureCollection', features } as FeatureCollection<Point>)
  return c.geometry.coordinates as [number, number]
})

function pathwayIcon (mode: number): { url: string, label: string } {
  const m = PathwayModeIcons[mode]
  if (!m) {
    return { url: '', label: '' }
  }
  return { url: `/icons/${m.altIcon ? m.altIcon : m.icon}.png`, label: m.label }
}
</script>
