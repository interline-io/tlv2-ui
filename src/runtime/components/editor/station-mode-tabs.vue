<template>
  <div class="tabs is-centered is-boxed is-medium">
    <ul>
      <li :class="(activeTab === 'levels') ? 'is-active' : ''">
        <nuxt-link
          :to="{name:routeKeys['levels'], params: {feedKey:feedKey,feedVersionKey:feedVersionKey,stationKey:stationKey}}"
        >
          <i class="mdi mdi-layers mdi-16px" /> &nbsp; Draw Levels
        </nuxt-link>
      </li>
      <li :class="(activeTab === 'stops') ? 'is-active' : ''">
        <span>
          <nuxt-link
            :to="{name:routeKeys['stops'], params: {feedKey:feedKey,feedVersionKey:feedVersionKey,stationKey:stationKey}}"
          >
            <i class="mdi mdi-map-marker mdi-16px" /> &nbsp; Assign Stops to Platforms
          </nuxt-link></span>
      </li>
      <li :class="(activeTab === 'pathways') ? 'is-active' : ''">
        <nuxt-link
          :to="{name:routeKeys['pathways'], params: {feedKey:feedKey,feedVersionKey:feedVersionKey,stationKey:stationKey}}"
          :event="pathwaysModeEnabled ? 'click' : ''"
          :class="pathwaysModeEnabled ? '' : 'disabled'"
        >
          <i class="mdi mdi-chart-timeline-variant-shimmer mdi-16px" /> &nbsp; Draw Pathways
        </nuxt-link>
      </li>
      <li :class="(activeTab === 'diagram') ? 'is-active' : ''">
        <nuxt-link
          :to="{name:routeKeys['diagram'], params: {feedKey:feedKey,feedVersionKey:feedVersionKey,stationKey:stationKey}}"
        >
          <i class="mdi mdi-chart-timeline mdi-16px" /> &nbsp; View Diagram
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { routeKeys } from './station'

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
    feedVersionKey: {
      type: String,
      default: null
    },
    stationKey: {
      type: String,
      default: null
    }
  },
  data () { return { routeKeys } },
  computed: {
    pathwaysModeEnabled () {
      return (this.station && this.station.stops && this.station.stops.length > 0)
    },
    currentRoute () {
      return this.$route.name
    },
    activeTab () {
      for (const [k, r] of Object.entries(routeKeys)) {
        if (this.currentRoute === r) {
          return k
        }
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .disabled {
    color: lightgrey;
    pointer-events: none;
  }
</style>
