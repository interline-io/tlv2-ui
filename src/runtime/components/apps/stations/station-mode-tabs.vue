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

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useRouteResolver } from '../../../composables/useRouteResolver'
import type { Station } from './station'

export default defineComponent({
  props: {
    station: {
      type: Object as PropType<Station | null>,
      default: null
    },
    feedKey: {
      type: String,
      default: null
    },
    stopAssociationsEnabled: {
      type: Boolean,
      default: false
    },
    feedVersionKey: {
      type: String,
      default: null
    },
    stationKey: {
      type: String,
      default: null
    }
  },
  setup () {
    const { resolve } = useRouteResolver()
    return { resolve }
  },
  data () {
    return {
      routeKeys: {
        levels: 'apps-stations-feedKey-feedVersionKey-stations-stationKey',
        stops: 'apps-stations-feedKey-feedVersionKey-stations-stationKey-stops',
        pathways: 'apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways',
        diagram: 'apps-stations-feedKey-feedVersionKey-stations-stationKey-diagram'
      }
    }
  },
  computed: {
    pathwaysModeEnabled (): boolean {
      return true
      // return (this.station && this.station.stops && this.station.stops.length > 0)
    },
    currentRoute (): string | undefined {
      const name = this.$route.name
      return typeof name === 'string' ? name : undefined
    },
    activeTab (): string {
      for (const [k, r] of Object.entries(this.routeKeys)) {
        if (this.currentRoute === this.resolve(r)) {
          return k
        }
      }
      return ''
    }
  }
})
</script>

<style scoped lang="scss">
  .disabled {
    color: lightgrey;
    pointer-events: none;
  }
</style>
