<template>
  <div>
    <div v-for="(entities,agency) in agencyFeatures" :key="agency">
      <strong>{{ agency }} </strong>
      <template v-if="(routeCount + stopCount) > maxAgencyRows && collapse">
        <div v-if="routeCount > 0">
          {{ routeCount }} routes
        </div>
        <div v-if="stopCount > 0">
          {{ stopCount }} stops
        </div>
      </template>
      <template v-else>
        <div v-for="route in entities.routes" :key="route.id">
          <nuxt-link
            v-if="link"
            :to="{name: 'routes-onestop_id', params:{onestop_id:route.onestop_id || 'search' }, query:( (linkVersion || !route.onestop_id) ? {feed_onestop_id:route.feed_onestop_id,feed_version_sha1:route.feed_version_sha1,route_id:route.route_id} : {})}"
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
        <div v-for="stop in entities.stops" :key="stop.id">
          <nuxt-link
            :to="{name: 'stops-onestop_id', params:{onestop_id:stop.onestop_id || 'search' }, query:( (linkVersion || !stop.onestop_id) ? {feed_onestop_id:stop.feed_onestop_id,feed_version_sha1:stop.feed_version_sha1,stop_id:stop.stop_id} : {})}"
          >
            {{ stop.stop_name }}
            <!-- <tl-route-icon
              :key="route.id"
              :route-type="route.route_type"
              :route-short-name="route.route_short_name"
              :route-long-name="route.route_long_name"
            /> -->
          </nuxt-link>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    link: { type: Boolean, default: true },
    maxAgencyRows: { type: Number, default () { return 5 } },
    collapse: { type: Boolean },
    linkVersion: { type: Boolean, default: false },
    agencyFeatures: { type: Object, default () { return {} } }
  },
  computed: {
    routeCount () {
      let count = 0
      for (const a of Object.values(this.agencyFeatures)) {
        count = count + Object.keys(a.routes).length
      }
      return count
    },
    stopCount () {
      let count = 0
      for (const a of Object.values(this.agencyFeatures)) {
        count = count + Object.keys(a.stops).length
      }
      return count
    }
  }
}
</script>
