<template>
  <div class="container">
    <tl-loading v-if="$apollo.loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="entity">
      <Meta name="description" :content="staticDescription" />
      <Meta name="twitter:title" :content="staticTitle" />
      <Meta name="twitter:description" :content="staticDescription" />
      <Meta name="og:title" :content="staticTitle" />
      <Meta name="og:description" :content="staticDescription" />

      <nav class="breadcrumb">
        <ul>
          <li>
            <a href="#">Stops</a>
          </li>
          <li>
            <nuxt-link :to="{name: 'stops-onestop_id', params:{onestop_id:$route.params.onestop_id}}">
              {{ entity.stop_name }}
            </nuxt-link>
          </li>
        </ul>
      </nav>

      <slot name="title">
        <tl-title :title="entity.stop_name">
          {{ entity.stop_name }}
        </tl-title>
      </slot>

      <!-- Warnings for freshness and viewing a specific version -->
      <tl-check-fresh :fetched="entity.feed_version.fetched_at" />
      <tl-check-single :feed-onestop-id="feedOnestopId" :feed-version-sha1="feedVersionSha1" />

      <slot name="contentBeforeTable" :entity="entity" />

      <!-- Main content -->
      <div class="columns">
        <div class="column is-two-thirds">
          <table class="table is-borderless property-list tl-props">
            <tbody>
              <tr>
                <td>
                  <o-tooltip
                    dashed
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
          </table>

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
            <o-tab-item id="summary" label="Summary">
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
                      :to="{name:'routes-onestop_id', params:{onestop_id:rs.route.onestop_id}}"
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
                      :to="{name:'routes-onestop_id', params:{onestop_id:rs.route.onestop_id}}"
                    >
                      <tl-route-icon :route-type="rs.route.route_type" :route-short-name="rs.route.route_short_name" :route-long-name="rs.route.route_long_name" :route-link="rs.route.route_url" />
                    </nuxt-link>
                  </div>
                </div>
              </div>
            </o-tab-item>

            <o-tab-item id="departures" label="Departures">
              <tl-stop-departures
                v-if="entity.id && activeTab == 2"
                :show-fallback-selector="true"
                :stop-ids="entityIds"
                :search-coords="entity.geometry.coordinates"
              />
              <tl-msg-info>
                <p><a href="https://www.transit.land/documentation/rest-api/departures" target="_blank">Learn more about Transitland v2 REST API stop departures endpoint</a></p>
              </tl-msg-info>
            </o-tab-item>

            <!-- Data sources -->
            <o-tab-item id="sources" label="Sources">
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
                            name: 'feeds-feed',
                            params: { feed: row.feed_onestop_id },
                          }"
                        >
                          {{ $filters.shortenName(row.feed_onestop_id) }}
                        </nuxt-link>
                      </td>
                      <td>
                        <nuxt-link
                          :to="{
                            name: 'feeds-feed-versions-version',
                            params: {
                              feed: row.feed_onestop_id,
                              version: row.feed_version_sha1,
                            },
                          }"
                        >
                          {{ $filters.shortenName(row.feed_version_sha1, 8) }}
                        </nuxt-link>
                      </td>
                      <td>
                        <nuxt-link
                          :to="{
                            name: 'stops-onestop_id',
                            params: { onestop_id: row.onestop_id },
                            query: {
                              feed_onestop_id: row.feed_onestop_id,
                              feed_version_sha1: row.feed_version_sha1,
                              route_id: row.stop_id,
                            },
                          }"
                        >
                          {{ $filters.shortenName(row.stop_id) }}
                        </nuxt-link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </o-tab-item>
          </o-tabs>
        </div>
        <div class="column is-one-third">
          <tl-map-viewer
            :stop-features="stopFeatures"
            :route-features="routeFeatures"
            :features="features"
            :auto-fit="false"
            :center="entity.geometry.coordinates"
            :circle-radius="20"
            :zoom="15"
            :overlay="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import EntityPageMixin from './entity-page-mixin'

const q = gql`
fragment rs on RouteStop {
  route {
    id
    onestop_id
    route_long_name
    route_short_name
    route_type
    route_url
    route_id
    route_color
    geometry
    agency {
      agency_name
      id
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

query ($onestop_id: String, $ids: [Int!], $entity_id: String, $feed_onestop_id: String, $feed_version_sha1: String, $limit: Int=10, $allow_previous_onestop_ids: Boolean = false) {
  entities: stops(limit: 10, ids: $ids, where: {onestop_id: $onestop_id, feed_onestop_id:$feed_onestop_id, feed_version_sha1:$feed_version_sha1, stop_id:$entity_id, allow_previous_onestop_ids: $allow_previous_onestop_ids}) {
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
    nearby_stops(radius:100) {
      ...ss
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
        return this.searchKey
      }
    }
  },
  data () {
    return {
      radius: 1000,
      tabIndex: {
        1: 'summary',
        2: 'departures',
        3: 'sources'
      }
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
    stopFeatures () {
      const ret = []
      for (const i of this.allStops) {
        if (!i.geometry) {
          continue
        }
        ret.push({ type: 'Feature', id: i.id, geometry: i.geometry, properties: { class: 'stop', id: i.id } })
      }
      return ret
    },
    routeFeatures () {
      const ret = []
      let featid = 1
      for (const rss of Object.values(this.servedRoutes || {})) {
        for (const rs of rss) {
          let routeColor = rs.route.route_color
          if (routeColor && routeColor.substr(0, 1) !== '#') {
            routeColor = '#' + routeColor
          }
          featid++
          ret.push(
            {
              type: 'Feature',
              id: featid,
              geometry: rs.route.geometry,
              properties: {
                class: 'route',
                id: featid,
                generated: false,
                geometry_length: -1,
                headway_secs: 60,
                route_color: routeColor,
                route_long_name: rs.route.route_long_name,
                route_short_name: rs.route.route_short_name,
                route_type: rs.route.route_type,
                route_url: rs.route.route_url,
                route_id: rs.route.route_id,
                agency_name: rs.route.agency.agency_name
              }
            }
          )
        }
      }
      return ret
    },
    allStops () {
      const ret = {}
      for (const ent of this.roots) {
        ret[ent.id] = ent
        if (ent.parent) {
          ret[ent.parent.id] = parent
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
        for (const rs of ent.route_stops) {
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
