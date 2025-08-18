<template>
  <div>
    <tl-loading v-if="$apollo.loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="entity">
      <slot name="title">
        <tl-title :title="staticTitle" :description="staticDescription">
          {{ entity.stop_name }}
        </tl-title>
      </slot>

      <!-- Warnings for freshness and viewing a specific version -->
      <tl-check-fresh :fetched="entity.feed_version.fetched_at" />
      <tl-check-single :feed-onestop-id="searchKey.feedOnestopId" :feed-version-sha1="searchKey.feedVersionSha1" />

      <slot name="contentBeforeTable" :entity="entity" />

      <!-- Main content -->
      <div class="columns">
        <div class="column is-two-thirds">
          <tl-props>
            <tbody>
              <tr>
                <td>
                  <o-tooltip
                    label="A globally unique identifier for this route"
                  >
                    Onestop ID
                  </o-tooltip>
                </td>
                <td>
                  <div v-for="root of roots" :key="root.id">
                    <tl-safelink :text="entity.onestop_id" />
                  </div>
                </td>
              </tr>
              <tr>
                <td>Name</td>
                <td>
                  <div v-for="root of roots" :key="root.id">
                    {{ root.stop_name }}
                  </div>
                </td>
              </tr>
              <tr v-if="stopUrls.length > 0">
                <td>URL</td>
                <td>
                  <div v-for="stop of stopUrls" :key="stop.id">
                    <tl-safelink :url="stop.stop_url" />
                  </div>
                </td>
              </tr>
              <tr>
                <td>GTFS ID</td>
                <td>
                  <div v-for="root of roots" :key="root.id">
                    <template v-if="(root.children || []).length > 0">
                      Station:
                    </template>
                    <tl-safelink :text="root.stop_id" />
                    <div v-for="child of root.children || []" :key="child.id" class="child-stop-id">
                      <template v-if="child.location_type === 0">
                        Platform: <tl-safelink :text="child.stop_id" />
                      </template>
                      <template v-if="child.location_type === 2">
                        Entrance: <tl-safelink :text="child.stop_id" />
                      </template>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="stopDescs.length > 0">
                <td>Description</td>
                <td>
                  <div v-for="stop of stopDescs" :key="stop.id">
                    {{ stop.stop_desc }}
                  </div>
                </td>
              </tr>
            </tbody>
          </tl-props>

          <slot name="contentAfterTable" :entity="entity">
            <tl-msg-info>
              <p>Learn more about <a href="https://www.transit.land/documentation/concepts/stops">stops in the Transitland documentation</a>.</p>
            </tl-msg-info>
          </slot>

          <div v-for="ent of entities" :key="ent.id">
            <tl-msg-warning
              v-for="(alert,idx) of ent.alerts"
              :key="idx"
            >
              Agency Alert:
              <div v-for="tr of filterRTTranslations(alert.header_text)" :key="tr.text">
                {{ tr.text }}
              </div>
              <div v-for="tr of filterRTTranslations(alert.description_text)" :key="tr.text">
                {{ tr.text }}
              </div>
            </tl-msg-warning>
          </div>

          <o-tabs v-model="activeTab" class="tl-tabs" type="boxed" :animated="false" @update:model-value="setTab">
            <o-tab-item :value="tabNames.summary" label="Summary">
              <div v-if="servedRoutes">
                <h6 class="title is-6">
                  Routes at this stop
                </h6>
                <div v-for="(rss,agency) of servedRoutes" :key="agency">
                  <div class="agency-name">
                    {{ agency }}
                  </div>
                  <div v-for="rs of rss" :key="rs.route.id">
                    <nuxt-link
                      :to="$filters.makeRouteLink(rs.route.onestop_id,rs.route.feed_onestop_id,rs.route.feed_version_sha1,rs.route.route_id,rs.route.id,linkVersion)"
                    >
                      <tl-route-icon :route-type="rs.route.route_type" :route-short-name="rs.route.route_short_name" :route-long-name="rs.route.route_long_name" :route-link="rs.route.route_url" />
                    </nuxt-link>
                  </div>
                </div>
              </div>

              <div v-if="nearbyRoutes">
                <h6 class="title is-6">
                  Routes at nearby stops
                </h6>
                <div v-for="(rss,agency) of nearbyRoutes" :key="agency">
                  <div class="agency-name">
                    {{ agency }}
                  </div>
                  <div v-for="rs of rss" :key="rs.route.id">
                    <nuxt-link
                      :to="$filters.makeRouteLink(rs.route.onestop_id,rs.route.feed_onestop_id,rs.route.feed_version_sha1,rs.route.route_id,rs.route.id,linkVersion)"
                    >
                      <tl-route-icon :route-type="rs.route.route_type" :route-short-name="rs.route.route_short_name" :route-long-name="rs.route.route_long_name" :route-link="rs.route.route_url" />
                    </nuxt-link>
                  </div>
                </div>
              </div>
            </o-tab-item>

            <!-- Data sources -->
            <o-tab-item :value="tabNames.sources" label="Sources">
              <div class="table-container">
                <table class="table is-striped is-fullwidth">
                  <thead>
                    <tr>
                      <th>Feed</th>
                      <th>Version</th>
                      <th>Stop ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row of allStops" :key="row.id">
                      <td>
                        <nuxt-link
                          :to="{
                            name: 'feeds-feedKey',
                            params: { feedKey: row.feed_onestop_id },
                          }"
                        >
                          {{ $filters.shortenName(row.feed_onestop_id) }}
                        </nuxt-link>
                      </td>
                      <td>
                        <nuxt-link
                          :to="{
                            name: 'feeds-feedKey-versions-feedVersionKey',
                            params: {
                              feedKey: row.feed_onestop_id,
                              feedVersionKey: row.feed_version_sha1,
                            },
                          }"
                        >
                          {{ $filters.shortenName(row.feed_version_sha1, 8) }}
                        </nuxt-link>
                      </td>
                      <td>
                        <nuxt-link
                          :to="$filters.makeStopLink(row.onestop_id, row.feed_onestop_id, row.feed_version_sha1, row.stop_id, row.id, true)"
                        >
                          {{ $filters.shortenName(row.stop_id) }}
                        </nuxt-link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </o-tab-item>

            <o-tab-item :value="tabNames.departures" label="Departures">
              <client-only placeholder="Departures">
                <tl-login-gate role="tl_user">
                  <tl-stop-departures
                    v-if="entity.id && activeTab === tabNames.departures"
                    :show-fallback-selector="true"
                    :stop-ids="entityIds"
                    :search-coords="entity.geometry.coordinates"
                  />
                  <template #loginText>
                    <o-notification icon="lock">
                      To view upcoming departure times, please sign into an Interline account with a Transitland subscription.
                    </o-notification>
                  </template>
                  <template #roleText>
                    <o-notification icon="lock">
                      Your account does not have permission to view upcoming departures. Please <a href="https://app.interline.io/products/tlv2_api/orders/new">sign up for a Transitland subscription</a>.
                    </o-notification>
                  </template>
                </tl-login-gate>
              </client-only>
              <tl-msg-info>
                <p><a href="https://www.transit.land/documentation/rest-api/departures" target="_blank">Learn more about Transitland v2 REST API stop departures endpoint</a></p>
              </tl-msg-info>
            </o-tab-item>
          </o-tabs>
        </div>
        <div class="column is-one-third">
          <client-only placeholder="Map">
            <tl-login-gate role="tl_user">
              <tl-feed-version-map-viewer
                :route-ids="routeIds"
                :features="features"
                :auto-fit="false"
                :center="entity.geometry.coordinates"
                :include-stops="true"
                :circle-radius="20"
                :zoom="15"
                :overlay="true"
              />
              <template #loginText>
                <o-notification icon="lock">
                  To view an interactive map of this stop location and incoming/outgoing routes, sign into a Transitland account.
                </o-notification>
              </template>
              <template #roleText>
                <o-notification icon="lock">
                  Your account does not have permission to view stop map.
                </o-notification>
              </template>
            </tl-login-gate>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'
import EntityPageMixin from './entity-page-mixin'
import { useEventBus } from '#imports'

const q = gql`
fragment rs on RouteStop {
  route {
    id
    onestop_id
    route_long_name
    route_short_name
    route_type
    route_id
    route_color
    feed_onestop_id
    feed_version_sha1
    agency {
      id
      agency_name
      operator {
        onestop_id
      }
    }
  }
}

fragment alert on Alert {
  cause
  effect
  severity_level
  description_text {
    language
    text
  }
  header_text {
    language
    text
  }
  url {
    language
    text
  }
}

fragment ss on Stop {
  id
  feed_version_sha1
  feed_onestop_id
  onestop_id
  stop_id
  stop_name
  stop_timezone
  stop_url
  location_type
  wheelchair_boarding
  zone_id
  geometry
  feed_version { 
    fetched_at
  }
  alerts(active:true) {
    ...alert
  }
}

query ($onestopId: String, $ids: [Int!], $entityId: String, $feedOnestopId: String, $feedVersionSha1: String, $limit: Int=10, $allowPreviousOnestopIds: Boolean = false) {
  entities: stops(limit: $limit, ids: $ids, where: {onestop_id: $onestopId, feed_onestop_id:$feedOnestopId, feed_version_sha1:$feedVersionSha1, stop_id:$entityId, allow_previous_onestop_ids: $allowPreviousOnestopIds}) {
    ...ss
    parent {
      ...ss
      children {
        ...ss
        route_stops {
          ...rs
        }
      }
    }
    children {
      ...ss
      route_stops {
        ...rs
      }
    }
    route_stops {
      ...rs
    }
    nearby_stops(radius:50)  {
      id
      onestop_id
      stop_id
      stop_name
      route_stops {
        ...rs
      }
    }
  }
}
`

export default {
  mixins: [EntityPageMixin],
  apollo: {
    entities: {
      query: q,
      skip () { return this.checkSearchSkip(this.$route.query.stop_id) },
      variables () {
        return this.entityVariables
      }
    }
  },
  data () {
    return {
      radius: 1000,
      tabNames: this.makeTabNames(['summary', 'sources', 'departures']),
      activeTab: 'summary'
    }
  },

  computed: {
    allAlerts  () {
      const ret = []
      for (const stop of this.allStops) {
        for (const alert of stop.alerts || []) {
          ret.push(alert)
        }
      }
      return ret
    },
    routeIds () {
      const ret = new Map()
      for (const rss of Object.values(this.servedRoutes || {})) {
        for (const rs of rss) {
          ret.set(rs.route.id, true)
        }
      }
      return Array.from(ret.keys())
    },
    allStops () {
      const ret = {}
      for (const ent of this.roots) {
        ret[ent.id] = ent
        if (ent.parent) {
          ret[ent.parent.id] = ent.parent
        }
        for (const child of ent.children || []) {
          ret[child.id] = child
        }
      }
      return Object.values(ret)
    },
    servedRoutes () {
      const ret = {}
      for (const stop of this.allStops) {
        for (const rs of stop.route_stops || []) {
          ret[rs.route.id] = rs
        }
      }
      const byAgency = {}
      for (const r of Object.values(ret)) {
        const key = r.route.agency.agency_name
        const a = byAgency[key] || []
        a.push(r)
        byAgency[key] = a
      }
      if (Object.keys(byAgency).length === 0) {
        return null
      }
      return byAgency
    },
    nearbyStops () {
      const ret = []
      const excl = {}
      for (const stop of this.allStops) {
        excl[stop.id] = true
      }
      for (const ent of this.entities) {
        for (const ns of ent.nearby_stops || []) {
          if (excl[ns.id]) {
            continue
          }
          ret.push(ns)
          excl[ns.id] = true
        }
      }
      return ret
    },
    nearbyRoutes () {
      const ret = {}
      const excl = {}
      for (const rss of Object.values(this.servedRoutes || {})) {
        for (const rs of rss) {
          excl[rs.route.id] = true
        }
      }
      for (const ent of this.nearbyStops) {
        for (const rs of ent.route_stops || []) {
          if (excl[rs.route.id]) {
            continue
          }
          ret[rs.route.id] = rs
        }
      }
      const byAgency = {}
      for (const r of Object.values(ret)) {
        const key = r.route.agency.agency_name
        const a = byAgency[key] || []
        a.push(r)
        byAgency[key] = a
      }
      if (Object.keys(byAgency).length === 0) {
        return null
      }
      return byAgency
    },
    stopUrls () {
      return this.allStops.filter((s) => { return s.stop_url })
    },
    stopDescs () {
      return this.allStops.filter((s) => { return s.stop_desc })
    },
    features () {
      const ret = []
      const sg = this.entity.geometry
      let featid = 1

      for (const i of this.allStops) {
        if (!i.geometry) {
          continue
        }
        if (!(i.location_type !== 0 || i.location_type !== 2)) {
          continue
        }
        ret.push({
          type: 'Feature',
          id: i.id,
          geometry: i.geometry,
          properties: {
            class: 'stop',
            id: i.id

          }
        })
      }

      for (const i of this.entity.children || []) {
        ret.push({
          type: 'Feature',
          id: featid,
          properties: { },
          geometry: {
            type: 'LineString',
            coordinates: [
              sg.coordinates,
              i.geometry.coordinates
            ]
          }
        })
        featid++
      }
      return ret
    },
    entityIds () {
      return this.allStops.map((s) => { return s.id })
    },
    roots () {
      const ret = {}
      for (const ent of this.entities) {
        if (ent.parent) {
          ret[ent.parent.id] = ent.parent
        } else {
          ret[ent.id] = ent
        }
      }
      return Object.values(ret)
    },
    entity () {
      return this.roots.length > 0 ? this.roots[0] : null
    },
    staticTitle () {
      return `${this.entity.stop_name} • Stop`
    },
    staticDescription () {
      return `${this.entity.stop_name} stop available for browsing and analyzing on the Transitland platform`
    }
  },
  watch: {
    'entity.stop_name' (v) {
      useEventBus().$emit('setParamKey', 'stopKey', v)
    }
  },
  methods: {
    filterRTTranslations (v) {
      return v.filter((s) => { return !s.language.includes('html') })
    }
  }
}
</script>

<style scoped>
.child-stop-id {
  padding-left:20px;
}
.agency-name {
  margin:0px;
  margin-top:10px;
  margin-bottom:10px;
}
</style>
