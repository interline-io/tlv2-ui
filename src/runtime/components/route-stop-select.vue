<template>
  <div>
    <div v-for="(features, agency) in agencyFeatures" :key="agency">
      <h6 class="title is-6 mt-2">
        {{ agency }}
      </h6>
      <template v-if="isCollapsed">
        <div>
          <span v-if="Object.keys(features.routes || {}).length">{{ Object.keys(features.routes || {}).length }} routes</span>
          <span v-if="Object.keys(features.stops || {}).length">
            <template v-if="Object.keys(features.routes || {}).length">, </template>
            {{ Object.keys(features.stops || {}).length }} stops
          </span>
        </div>
      </template>
      <template v-else>
        <!-- Routes -->
        <div v-if="Object.keys(features.routes || {}).length > 0">
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

        <hr v-if="Object.keys(features.routes || {}).length > 0 && Object.keys(features.stops || {}).length > 0" />
        <!-- Stops -->
        <div v-if="Object.keys(features.stops || {}).length > 0">
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

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  link?: boolean
  maxAgencyRows?: number
  collapse?: boolean
  linkVersion?: boolean
  showStops?: boolean
  agencyFeatures: Record<string, {
    routes?: Record<string, {
      id: string | number
      route_type: number
      route_short_name: string
      route_long_name: string
      onestop_id: string
      feed_onestop_id: string
      feed_version_sha1: string
      route_id: string
    }>
    stops?: Record<string, {
      id: string | number
      location_type: number
      stop_name: string
      onestop_id: string
      feed_onestop_id: string
      feed_version_sha1: string
      stop_id: string
    }>
  }>
}

const props = withDefaults(defineProps<Props>(), {
  link: false,
  maxAgencyRows: 5,
  collapse: false,
  linkVersion: false,
  showStops: true,
  agencyFeatures: () => ({})
})

const isCollapsed = computed(() => {
  return totalFeatureCount.value > props.maxAgencyRows && props.collapse
})

const totalFeatureCount = computed(() => {
      let count = 0
  for (const agency of Object.values(props.agencyFeatures)) {
        count += Object.keys(agency.routes || {}).length
        count += Object.keys(agency.stops || {}).length
      }
      return count
})
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
hr {
  margin: 0.5rem 0;
}
</style>
