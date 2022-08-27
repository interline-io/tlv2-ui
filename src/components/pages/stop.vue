<template>
  <div class="container">
    <span v-if="$apollo.loading" class="is-loading" />
    <div v-else-if="entity">
      <nav class="breadcrumb">
        <ul>
          <li>
            <nuxt-link :to="{name:'stops'}">
              Stops
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{name: 'stops-onestop_id', params:{onestop_id:$route.params.onestop_id}}">
              {{ entity.stop_name }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
      <h1 class="title">
        {{ entity.stop_name }}
      </h1>

      <!-- Warnings for freshness and viewing a specific version -->
      <b-message v-if="dataFreshness > 365" type="is-warning" has-icon>
        The GTFS feeds associated with this page were fetched {{ dataFreshness }} days ago; use caution or check if newer data is available.
      </b-message>
      <b-message v-if="linkVersion" type="is-warning" has-icon>
        You are viewing a single GTFS stop or station defined in source feed
        <nuxt-link :to="{name:'feeds-feed', params:{feed:$route.query.feed_onestop_id}}">
          {{ $route.query.feed_onestop_id | shortenName }}
        </nuxt-link> version
        <nuxt-link :to="{name:'feeds-feed-versions-version', params:{feed:$route.query.feed_onestop_id, version:$route.query.feed_version_sha1}}">
          {{ $route.query.feed_version_sha1 | shortenName(8) }}
        </nuxt-link>.<br>
        <template v-if="!search">
          Click <nuxt-link :to="{name: 'stops-onestop_id', params:{onestop_id:$route.params.onestop_id}}">
            here
          </nuxt-link> to return to the main view.
        </template>
      </b-message>

      <!-- Main content -->
      <div class="columns">
        <div class="column is-two-thirds">
          <table class="table is-borderless property-list">
            <tr>
              <td>
                <b-tooltip
                  dashed
                  label="A globally unique identifier for this route"
                >
                  Onestop ID
                </b-tooltip>
              </td>
              <td>
                <div v-for="root of roots" :key="root.id">
                  {{ root.onestop_id }}
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
                  {{ stop.stop_url }}
                  <a
                    :href="stop.stop_url"
                    target="_blank"
                  ><b-icon
                    icon="link"
                  /></a>
                </div>
              </td>
            </tr>
            <tr>
              <td>GTFS ID</td>
              <td>
                <div v-for="root of roots" :key="root.id">
                  <template v-if="root.children.length > 0">
                    Station:
                  </template>
                  {{ root.stop_id }}
                  <div v-for="child of root.children" :key="child.id" class="child-stop-id">
                    Platform: {{ child.stop_id }}
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
          </table>

          <b-message
            v-for="(alert,idx) of allAlerts"
            :key="idx"
            type="is-warning"
            class="block"
            has-icon
          >
            <div v-for="tr of filterRTTranslations(alert.description_text)" :key="tr.text">
              Agency Alert: {{ tr.text }}
            </div>
          </b-message>

          <b-message type="is-info" class="block">
            Learn more about the contents of <code>stops.txt</code> on
            <a
              href="https://gtfs.org/reference/static#stopstxt"
              target="_blank"
            >gtfs.org</a>.
          </b-message>

          <b-tabs v-model="activeTab" type="is-boxed" :animated="false">
            <b-tab-item label="Summary">
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
            </b-tab-item>

            <b-tab-item v-if="entity.id" label="Departures">
              <client-only placeholder="Departures">
                <tl-stop-departures
                  v-if="activeTab == 1"
                  :show-fallback-selector="true"
                  :stop-ids="entityIds"
                  :search-coords="entity.geometry.coordinates"
                />
              </client-only>
            </b-tab-item>

            <!-- Data sources -->
            <b-tab-item label="Sources">
              <b-table
                :data="allStops"
                :striped="true"
              >
                <b-table-column v-slot="props" field="feed_onestop_id" label="Feed">
                  <nuxt-link :to="{name:'feeds-feed', params:{feed:props.row.feed_onestop_id}}">
                    {{ props.row.feed_onestop_id | shortenName }}
                  </nuxt-link>
                </b-table-column>
                <b-table-column v-slot="props" field="feed_version_sha1" label="Version">
                  <nuxt-link :to="{name:'feeds-feed-versions-version', params:{feed:props.row.feed_onestop_id, version:props.row.feed_version_sha1}}">
                    {{ props.row.feed_version_sha1 | shortenName(8) }}
                  </nuxt-link>
                </b-table-column>
                <b-table-column v-slot="props" field="stop_id" label="Stop ID">
                  <nuxt-link :to="{name:'stops-onestop_id', params:{onestop_id:props.row.onestop_id || 'search'}, query:{feed_onestop_id:props.row.feed_onestop_id, feed_version_sha1:props.row.feed_version_sha1, stop_id:props.row.stop_id}}">
                    {{ props.row.stop_id | shortenName }}
                  </nuxt-link>
                </b-table-column>
              </b-table>
            </b-tab-item>
          </b-tabs>
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
import Filters from '../filters'
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
  alerts(active:true) {
    ...alert
  }
}

query ($onestop_id: String, $stop_id: String, $feed_onestop_id: String, $feed_version_sha1: String) {
  entities: stops(limit: 100, where: {onestop_id: $onestop_id, feed_onestop_id:$feed_onestop_id, feed_version_sha1:$feed_version_sha1, stop_id:$stop_id}) {
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
  mixins: [EntityPageMixin, Filters],
  apollo: {
    entities: {
      query: q,
      skip () { return this.checkSearchSkip(this.$route.query.stop_id) },
      variables () {
        return {
          onestop_id: this.$route.params.onestop_id,
          feed_onestop_id: this.$route.query.feed_onestop_id,
          feed_version_sha1: this.$route.query.feed_version_sha1,
          stop_id: this.$route.query.stop_id
        }
      }
    }
  },
  data () {
    return {
      radius: 1000
    }
  },
  head () {
    if (this.entity) {
      return {
        title: this.entity.stop_name,
        meta: [
          { hid: 'description', name: 'description', content: `${this.entity.stop_name} is a stop ` }
        ]
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
      for (const rss of Object.values(this.servedRoutes)) {
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
      for (const rss of Object.values(this.servedRoutes)) {
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
      for (const i of this.entity.children) {
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
          ret[ent.id] = ent.id
        }
      }
      return Object.values(ret)
    },
    entity () {
      return this.roots.length > 0 ? this.roots[0] : null
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
