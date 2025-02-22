<template>
  <div>
    <div v-for="(features, agency) in agencyFeatures" :key="agency">
      <h6 class="title is-6">
        {{ agency }}
      </h6>
      <template v-if="isCollapsed">
        <div>
          {{ Object.keys(features.routes || {}).length }} routes, 
          {{ Object.keys(features.stops || {}).length }} stops
        </div>
      </template>
      <template v-else>
        <!-- Routes -->
        <div v-if="Object.keys(features.routes || {}).length > 0">
          <h6 class="subtitle is-6">Routes:</h6>
          <div v-for="route in features.routes" :key="route.id" class="item-row">
            <nuxt-link
              v-if="link"
              :to="$filters.makeRouteLink(route.onestop_id, route.feed_onestop_id, route.feed_version_sha1, route.route_id, route.id, linkVersion)"
            >
              <tl-route-icon
                :key="route.id"
                :route-type="route.route_type"
                :route-short-name="route.route_short_name"
                :route-long-name="route.route_long_name"
              />
            </nuxt-link>
            <template v-else>
              <tl-route-icon
                :key="route.id"
                :route-type="route.route_type"
                :route-short-name="route.route_short_name"
                :route-long-name="route.route_long_name"
              />
            </template>
          </div>
        </div>

        <!-- Stops -->
        <div v-if="Object.keys(features.stops || {}).length > 0">
          <h6 class="subtitle is-6">Stops:</h6>
          <div v-for="stop in features.stops" :key="stop.id" class="item-row">
            <nuxt-link
              v-if="link"
              :to="$filters.makeStopLink(stop.onestop_id, stop.feed_onestop_id, stop.feed_version_sha1, stop.stop_id, stop.id, linkVersion)"
            >
              <div class="stop-item">
                <tl-stop-icon :location_type="stop.location_type" />
                {{ stop.stop_name || 'Unnamed Stop' }}
              </div>
            </nuxt-link>
            <template v-else>
              <div class="stop-item">
                <tl-stop-icon :location_type="stop.location_type" />
                {{ stop.stop_name || 'Unnamed Stop' }}
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    link: { type: Boolean, default: false },
    maxAgencyRows: { type: Number, default () { return 5 } },
    collapse: { type: Boolean },
    linkVersion: { type: Boolean, default: false },
    showStops: { type: Boolean, default: true },
    agencyFeatures: { type: Object, default () { return {} } }
  },
  computed: {
    isCollapsed () {
      return this.totalFeatureCount > this.maxAgencyRows && this.collapse
    },
    totalFeatureCount () {
      let count = 0
      for (const agency of Object.values(this.agencyFeatures)) {
        count += Object.keys(agency.routes || {}).length
        count += Object.keys(agency.stops || {}).length
      }
      return count
    }
  }
}
</script>

<style scoped>
.item-row {
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subtitle {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
</style>
