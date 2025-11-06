<template>
  <div class="tabs is-centered is-boxed">
    <ul>
      <li :class="(activeTab === 'levels') ? 'is-active' : ''">
        <nuxt-link
          :to="{ name: routeKeys['levels'], params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
        >
          <i class="mdi mdi-layers mdi-16px" /> &nbsp; Draw Levels
        </nuxt-link>
      </li>
      <li v-if="stopAssociationsEnabled" :class="(activeTab === 'stops') ? 'is-active' : ''">
        <span>
          <nuxt-link
            :to="{ name: routeKeys['stops'], params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
          >
            <i class="mdi mdi-map-marker mdi-16px" /> &nbsp; Associate Stops
          </nuxt-link></span>
      </li>
      <li :class="(activeTab === 'pathways') ? 'is-active' : ''">
        <nuxt-link
          :to="{ name: routeKeys['pathways'], params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
          :event="pathwaysModeEnabled ? 'click' : ''"
          :class="pathwaysModeEnabled ? '' : 'disabled'"
        >
          <i class="mdi mdi-chart-timeline-variant-shimmer mdi-16px" /> &nbsp; Draw Pathways
        </nuxt-link>
      </li>
      <li :class="(activeTab === 'diagram') ? 'is-active' : ''">
        <nuxt-link
          :to="{ name: routeKeys['diagram'], params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
        >
          <i class="mdi mdi-chart-timeline mdi-16px" /> &nbsp; Station Diagram
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { useEditorRoutes } from '../../composables/useEditorRoutes'

export default {
  props: {
    station: {
      type: Object,
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
  data () {
    const routes = useEditorRoutes()
    return {
      routeKeys: {
        levels: routes.stationIndex,
        stops: routes.stationStops,
        pathways: routes.stationPathways,
        diagram: routes.stationDiagram
      }
    }
  },
  computed: {
    pathwaysModeEnabled () {
      return true
      // return (this.station && this.station.stops && this.station.stops.length > 0)
    },
    currentRoute () {
      return this.$route.name
    },
    activeTab () {
      for (const [k, r] of Object.entries(this.routeKeys)) {
        if (this.currentRoute === r) {
          return k
        }
      }
      return ''
    }
  }
}
</script>

<style scoped lang="scss">
  .disabled {
    color: lightgrey;
    pointer-events: none;
  }
</style>
