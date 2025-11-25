<template>
  <div class="tabs is-centered is-boxed">
    <ul>
      <li :class="(activeTab === 'levels') ? 'is-active' : ''">
        <tl-link
          route-key="stationEditor-feedKey-feedVersionKey-stations-stationKey"
          :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
        >
          <i class="mdi mdi-layers mdi-16px" /> &nbsp; Draw Levels
        </tl-link>
      </li>
      <li v-if="stopAssociationsEnabled" :class="(activeTab === 'stops') ? 'is-active' : ''">
        <span>
          <tl-link
            route-key="stationEditor-feedKey-feedVersionKey-stations-stationKey-stops"
            :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
          >
            <i class="mdi mdi-map-marker mdi-16px" /> &nbsp; Associate Stops
          </tl-link></span>
      </li>
      <li :class="(activeTab === 'pathways') ? 'is-active' : ''">
        <tl-link
          route-key="stationEditor-feedKey-feedVersionKey-stations-stationKey-pathways"
          :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
          :event="pathwaysModeEnabled ? 'click' : ''"
          :class="pathwaysModeEnabled ? '' : 'disabled'"
        >
          <i class="mdi mdi-chart-timeline-variant-shimmer mdi-16px" /> &nbsp; Draw Pathways
        </tl-link>
      </li>
      <li :class="(activeTab === 'diagram') ? 'is-active' : ''">
        <tl-link
          route-key="stationEditor-feedKey-feedVersionKey-stations-stationKey-diagram"
          :to="{ params: { feedKey: feedKey, feedVersionKey: feedVersionKey, stationKey: stationKey } }"
        >
          <i class="mdi mdi-chart-timeline mdi-16px" /> &nbsp; Station Diagram
        </tl-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { useRouteResolver } from '../../../composables/useRouteResolver'

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
  setup () {
    const { resolve } = useRouteResolver()
    return { resolve }
  },
  data () {
    return {
      routeKeys: {
        levels: 'stationEditor-feedKey-feedVersionKey-stations-stationKey',
        stops: 'stationEditor-feedKey-feedVersionKey-stations-stationKey-stops',
        pathways: 'stationEditor-feedKey-feedVersionKey-stations-stationKey-pathways',
        diagram: 'stationEditor-feedKey-feedVersionKey-stations-stationKey-diagram'
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
        if (this.currentRoute === this.resolve(r)) {
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
