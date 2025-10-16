<template>
  <div>
    <div v-for="(routes,agency) in agencyFeatures" :key="agency">
      <h6 class="title is-6">
        {{ agency }}
      </h6>
      <template v-if="isCollapsed">
        <div>{{ Object.keys(routes).length }} routes</div>
      </template>
      <template v-else>
        <div v-for="route in routes" :key="route.id">
          <nuxt-link
            v-if="link"
            :to="makeRouteLink(route.onestop_id, route.feed_onestop_id, route.feed_version_sha1, route.route_id, route.id, linkVersion)"
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
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { makeRouteLink } from '../lib/filters'

// TypeScript interfaces
interface Route {
  id: number
  onestop_id: string
  feed_onestop_id: string
  feed_version_sha1: string
  route_id: string
  route_type: number
  route_short_name?: string | null
  route_long_name?: string | null
}

interface AgencyFeatures {
  [agencyName: string]: Route[]
}

// Props
const props = withDefaults(defineProps<{
  link?: boolean
  maxAgencyRows?: number
  collapse?: boolean
  linkVersion?: boolean
  agencyFeatures?: AgencyFeatures
}>(), {
  link: false,
  maxAgencyRows: 5,
  collapse: false,
  linkVersion: false,
  agencyFeatures: () => ({})
})

// Computed properties
const routeCount = computed((): number => {
  let count = 0
  for (const routes of Object.values(props.agencyFeatures)) {
    count = count + routes.length
  }
  return count
})

const isCollapsed = computed((): boolean => {
  return routeCount.value > props.maxAgencyRows && !!props.collapse
})
</script>
