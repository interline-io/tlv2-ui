<template>
  <div class="tabs is-centered is-boxed">
    <ul>
      <li :class="(activeTab === 'levels') ? 'is-active' : ''">
        <tl-link
          route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey"
          :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
        >
          <i class="mdi mdi-layers mdi-16px" /> &nbsp; Draw Levels
        </tl-link>
      </li>
      <li v-if="stopAssociationsEnabled" :class="(activeTab === 'stops') ? 'is-active' : ''">
        <span>
          <tl-link
            route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-stops"
            :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
          >
            <i class="mdi mdi-map-marker mdi-16px" /> &nbsp; Associate Stops
          </tl-link></span>
      </li>
      <li :class="(activeTab === 'pathways') ? 'is-active' : ''">
        <tl-link
          route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways"
          :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
          :class="pathwaysModeEnabled ? '' : 'disabled'"
        >
          <i class="mdi mdi-chart-timeline-variant-shimmer mdi-16px" /> &nbsp; Draw Pathways
        </tl-link>
      </li>
      <li :class="(activeTab === 'diagram') ? 'is-active' : ''">
        <tl-link
          route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-diagram"
          :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
        >
          <i class="mdi mdi-chart-timeline mdi-16px" /> &nbsp; Station Diagram
        </tl-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouteResolver } from '../../../composables/useRouteResolver'
import type { Station } from './station'

interface Props {
  station?: Station | null
  feedKey?: string | null
  stopAssociationsEnabled?: boolean
  feedVersionKey?: string | null
  stationKey?: string | null
}

withDefaults(defineProps<Props>(), {
  station: null,
  feedKey: null,
  stopAssociationsEnabled: false,
  feedVersionKey: null,
  stationKey: null
})

const { resolve } = useRouteResolver()
const route = useRoute()

const routeKeys = {
  levels: 'apps-stations-feedKey-feedVersionKey-stations-stationKey',
  stops: 'apps-stations-feedKey-feedVersionKey-stations-stationKey-stops',
  pathways: 'apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways',
  diagram: 'apps-stations-feedKey-feedVersionKey-stations-stationKey-diagram'
}

const pathwaysModeEnabled = computed((): boolean => {
  return true
  // return (station.value && station.value.stops && station.value.stops.length > 0)
})

const currentRoute = computed((): string | undefined => {
  const name = route.name
  return typeof name === 'string' ? name : undefined
})

const activeTab = computed((): string => {
  for (const [k, r] of Object.entries(routeKeys)) {
    if (currentRoute.value === resolve(r)) {
      return k
    }
  }
  return ''
})
</script>

<style scoped lang="scss">
  .disabled {
    color: lightgrey;
    pointer-events: none;
  }
</style>
