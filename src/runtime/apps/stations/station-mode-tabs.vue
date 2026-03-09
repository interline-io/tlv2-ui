<template>
  <div class="station-mode-tabs-bar">
    <div v-if="station?.stop?.stop_name" class="station-name-label pr-4">
      <h2 class="title is-5 mb-0">
        {{ station.stop.stop_name }}
      </h2>
    </div>
    <div class="tabs is-boxed mb-0">
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
          <tl-link
            route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-stops"
            :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
          >
            <i class="mdi mdi-map-marker mdi-16px" /> &nbsp; Associate Stops
          </tl-link>
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
        <li :class="(activeTab === 'pathways-v2') ? 'is-active' : ''">
          <tl-link
            route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways-v2"
            :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
            :class="pathwaysModeEnabled ? '' : 'disabled'"
          >
            <i class="mdi mdi-chart-timeline-variant-shimmer mdi-16px" /> &nbsp; Draw Pathways (v2 Preview)
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
        <li :class="(activeTab === 'simulator') ? 'is-active' : ''">
          <tl-link
            route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-simulator"
            :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
          >
            <i class="mdi mdi-cellphone mdi-16px" /> &nbsp; Simulator
          </tl-link>
        </li>
        <li :class="(activeTab === 'isometric') ? 'is-active' : ''">
          <tl-link
            route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-isometric"
            :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
          >
            <i class="mdi mdi-cube-outline mdi-16px" /> &nbsp; Isometric View
          </tl-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouteResolver } from '../../composables/useRouteResolver'
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
  'levels': 'apps-stations-feedKey-feedVersionKey-stations-stationKey',
  'stops': 'apps-stations-feedKey-feedVersionKey-stations-stationKey-stops',
  'pathways': 'apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways',
  'pathways-v2': 'apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways-v2',
  'diagram': 'apps-stations-feedKey-feedVersionKey-stations-stationKey-diagram',
  'simulator': 'apps-stations-feedKey-feedVersionKey-stations-stationKey-simulator',
  'isometric': 'apps-stations-feedKey-feedVersionKey-stations-stationKey-isometric'
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

  /* Bar: plain flexbox, no border of its own — Bulma's .tabs ul provides the single bottom line */
  .station-mode-tabs-bar {
    display: flex;
    align-items: stretch;
    background: var(--bulma-scheme-main);
    margin-bottom: 0.75rem;
  }

  /* Station name sits flush with the tabs ul border at the bottom */
  .station-name-label {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    border-bottom: 1px solid var(--bulma-border);
  }

  /* Tabs fill remaining width; items pushed to the right */
  .station-mode-tabs-bar :deep(.tabs) {
    flex: 1;
    margin-bottom: 0;
  }

  .station-mode-tabs-bar :deep(.tabs ul) {
    justify-content: flex-end;
  }
</style>
