<template>
  <div>
    <tl-loading v-if="$apollo.loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="entity">
      <Meta name="description" :content="staticDescription" />
      <Meta name="twitter:title" :content="staticTitle" />
      <Meta name="twitter:description" :content="staticDescription" />
      <Meta name="twitter:image" :content="staticImage" />
      <Meta name="twitter:image:alt" :content="staticDescription" />
      <Meta name="og:title" :content="staticTitle" />
      <Meta name="og:description" :content="staticDescription" />
      <Meta name="og:image:type" content="image/png" />
      <Meta name="og:image:width" content="800" />
      <Meta name="og:image:height" content="600" />
      <Meta name="og:image" :content="staticImage" />
      <Meta name="og:image:alt" :content="staticDescription" />

      <slot name="nav">
        <nav class="breadcrumb">
          <ul>
            <li>
              <nuxt-link :to="{ name: 'operators' }">
                Operators
              </nuxt-link>
            </li>
            <li>
              <nuxt-link
                v-if="entity.agency.onestop_id"
                :to="{
                  name: 'operators-operatorKey',
                  params: { operatorKey: entity.agency.onestop_id },
                }"
              >
                {{ entity.agency.agency_name }}
              </nuxt-link>
              <a v-else href="#">{{ entity.agency.agency_name }}</a>
            </li>
            <li>
              <nuxt-link
                :to="{
                  name: 'routes-routeKey',
                  params: { routeKey: pathKey },
                }"
              >
                {{ entity.route_short_name }}
                <template
                  v-if="entity.route_short_name != entity.route_long_name"
                >
                  {{ entity.route_long_name }}
                </template>
              </nuxt-link>
            </li>
          </ul>
        </nav>
      </slot>

      <slot name="title">
        <tl-title :title="staticTitle">
          <div v-for="ent of routeNames" :key="ent.id" class="title">
            {{ ent.agency.agency_name }} <br>
            <tl-route-icon
              :route-link="ent.route_url"
              :route-type="ent.route_type"
              :route-short-name="ent.route_short_name"
              :route-long-name="ent.route_long_name"
            />
          </div>
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
              <tr v-if="entity.onestop_id">
                <td>
                  <o-tooltip
                    dashed
                    label="A globally unique identifier for this route"
                  >
                    Onestop ID
                  </o-tooltip>
                </td>
                <td><tl-safelink :text="entity.onestop_id" /></td>
              </tr>
              <tr v-if="entity.agency">
                <td>Operated by</td>
                <td>
                  <nuxt-link
                    v-if="entity.agency.onestop_id"
                    :to="{
                      name: 'operators-operatorKey',
                      params: { operatorKey: entity.agency.onestop_id },
                    }"
                  >
                    {{ entity.agency.agency_name }}
                  </nuxt-link>
                  <a v-else href="#">{{ entity.agency.agency_name }}</a>
                </td>
              </tr>
              <tr v-if="entity.route_short_name">
                <td>Name (Short)</td>
                <td>
                  {{ entity.route_short_name }}
                </td>
              </tr>
              <tr v-if="entity.route_long_name">
                <td>Name (Long)</td>
                <td>
                  {{ entity.route_long_name }}
                </td>
              </tr>
              <tr>
                <td>Vehicle Type</td>
                <td>
                  <o-tooltip
                    dashed
                    :label="`Route with route_type = ${entity.route_type}`"
                  >
                    {{ $filters.routeTypeToWords(entity.route_type) }}
                  </o-tooltip>
                </td>
              </tr>
              <tr v-if="entity.route_url">
                <td>URL</td>
                <td>
                  <tl-safelink :url="entity.route_url" />
                </td>
              </tr>
              <tr>
                <td>GTFS ID</td>
                <td>
                  <tl-safelink :text="entity.route_id" />
                </td>
              </tr>
              <tr v-if="entity.entity_desc">
                <td>Description</td>
                <td>
                  {{ entity.entity_desc }}
                </td>
              </tr>
            </tbody>
          </table>

          <slot name="contentAfterTable" :entity="entity">
            <tl-msg-info>
              <p>Learn more about <a href="https://www.transit.land/documentation/concepts/routes">routes in the Transitland documentation</a>.</p>
            </tl-msg-info>
          </slot>

          <div v-for="ent of entities" :key="ent.id">
            <tl-msg-warning
              v-for="(alert,idx) of ent.alerts"
              :key="idx"
            >
              <p>Agency Alert:</p>
              <div v-for="tr of filterRTTranslations(alert.header_text)" :key="tr.text">
                {{ tr.text }}
              </div>
              <div v-for="tr of filterRTTranslations(alert.description_text)" :key="tr.text">
                {{ tr.text }}
              </div>
            </tl-msg-warning>
          </div>

          <o-tabs
            v-model="activeTab"
            class="tl-tabs"
            type="boxed"
            :animated="false"
            @update:model-value="setTab"
          >
            <o-tab-item id="summary" label="Connections">
              <tl-rsp-viewer v-if="activeTab === 1" :route-ids="entityIds" />
            </o-tab-item>
            <o-tab-item id="headways" label="Headways">
              <tl-headway-viewer :headways="entity.headways" />
            </o-tab-item>

            <!-- Data sources -->
            <o-tab-item id="sources" label="Source feed(s)">
              <div class="table-container">
                <table class="table is-striped is-fullwidth">
                  <thead>
                    <tr>
                      <th>Source feed Onestop ID</th>
                      <th>Feed version hash</th>
                      <th>Route ID</th>
                      <th>Links to view</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row of entities" :key="row.id">
                      <td>
                        <tl-safelink :text="row.feed_onestop_id" />
                      </td>
                      <td>
                        <tl-safelink :text="row.feed_version_sha1" max-width="100px" />
                      </td>
                      <td>
                        <tl-safelink :text="$filters.shortenName(row.route_id)" />
                      </td>
                      <td>
                        <nuxt-link
                          :to="{
                            name: 'feeds-feedKey',
                            params: { feedKey: row.feed_onestop_id },
                          }"
                          class="button is-primary is-small"
                        >
                          Feed
                        </nuxt-link> <nuxt-link
                          :to="{
                            name: 'feeds-feedKey-versions-feedVersionKey',
                            params: {
                              feedKey: row.feed_onestop_id,
                              feedVersionKey: row.feed_version_sha1,
                            },
                          }"
                          class="button is-primary is-small"
                        >
                          Feed version
                        </nuxt-link> <nuxt-link
                          :to="{
                            name: 'routes-routeKey',
                            params: { routeKey: row.onestop_id },
                            query: {
                              feed_onestop_id: row.feed_onestop_id,
                              feed_version_sha1: row.feed_version_sha1,
                              route_id: row.route_id,
                            },
                          }"
                          class="button is-primary is-small"
                        >
                          Route
                        </nuxt-link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </o-tab-item>

            <o-tab-item id="export" label="Export">
              <tl-data-export
                v-if="activeTab === 4"
                :route-name="routeName"
                :route-features="routeFeatures"
                :stop-features="stopFeatures"
                :route-ids="[entity.id]"
                @set-features="features = $event"
              />
            </o-tab-item>
          </o-tabs>
        </div>
        <div class="column is-one-third">
          <tl-feed-version-map-viewer
            :route-ids="entityIds"
            :overlay="false"
            :include-stops="true"
            :link-version="linkVersion"
            :features="activeTab === 4 ? features : []"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { useRuntimeConfig } from '#app'
import EntityPageMixin from './entity-page-mixin'

const q = gql`
query ($onestop_id: String, $ids: [Int!], $entity_id: String, $feed_onestop_id: String, $feed_version_sha1: String, $include_stops: Boolean! = true, $limit: Int=10, $allow_previous_onestop_ids: Boolean = false) {
  entities: routes(limit:$limit, ids: $ids, where: {onestop_id: $onestop_id, feed_onestop_id: $feed_onestop_id, feed_version_sha1: $feed_version_sha1, route_id: $entity_id, allow_previous_onestop_ids: $allow_previous_onestop_ids}) {
    id
    onestop_id
    feed_onestop_id
    feed_version_sha1
    route_id
    route_color
    route_desc
    route_long_name
    route_short_name
    route_type
    route_url
    geometry
    alerts(active:true) {
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
    route_stops @include(if: $include_stops) {
      stop {
        id
        stop_id
        stop_name
        geometry
      }
    }
    agency {
      id
      agency_id
      agency_name
      onestop_id
    }
    headways {
      dow_category
      service_date
      direction_id
      headway_secs
      departures
    }
    feed_version {
      id
      fetched_at
    }
  }
}
`

export default {
  mixins: [EntityPageMixin],
  apollo: {
    entities: {
      client: 'transitland',
      query: q,
      skip () {
        return this.checkSearchSkip(this.entityId)
      },
      variables () {
        return this.searchKey
      }
    }
  },
  data () {
    return {
      features: [],
      bufferGeom: null,
      routeGeom: null,
      censusGeoms: null,
      selectDate: null,
      tabIndex: {
        1: 'summary',
        2: 'headways',
        3: 'sources',
        4: 'export'
      }
    }
  },
  computed: {
    // routeFeatures and stopFeatures are calculated from the main
    // graphql response so we don't need to copy in and rely on the response from the map
    routeFeatures () {
      const ret = []
      for (const f of this.entities || []) {
        const fcopy = Object.assign({}, f)
        delete fcopy.geometry
        delete fcopy.__typename
        ret.push({
          type: 'Feature',
          geometry: f.geometry,
          properties: fcopy,
          id: f.id
        })
      }
      return ret
    },
    stopFeatures () {
      const ret = []
      for (const f of this.entities || []) {
        for (const g of f.route_stops || []) {
          const fcopy = Object.assign({}, g.stop)
          delete fcopy.geometry
          delete fcopy.__typename
          ret.push({
            type: 'Feature',
            geometry: g.stop.geometry,
            properties: fcopy,
            id: g.stop.id
          })
        }
      }
      return ret
    },
    routeName () {
      if (this.entity) {
        return `${this.entity.agency.agency_name} - ${this.entity.route_short_name} ${this.entity.route_long_name}`
      }
      return 'route'
    },
    routeNames () {
      const rs = new Map()
      for (const ent of this.entities) {
        const key = `${ent.agency.agency_name}-${ent.route_short_name}-${ent.route_long_name}-${ent.route_type}`
        rs.set(key, ent)
      }
      return Array.from(rs.values()).slice(0, 4)
    },
    routeType () {
      return this.$filters.routeTypeToWords(this.entity.route_type)
    },
    operators () {
      const rs = new Map()
      for (const ent of this.entities) {
        if (ent.operator) {
          rs.set(ent.operator.onestop_id, ent.operator)
        }
      }
      return Array.from(rs.values())
    },
    serviceDate: {
      get () {
        return this.$route.query.service_date
          ? this.$route.query.service_date
          : 'TODO'
      },
      set (value) {
        this.$router.push({
          name: this.$router.name,
          query: {
            service_date: value
          }
        })
      }
    },
    staticImage () {
      const config = useRuntimeConfig()
      return `${config.public.apiBase}/rest/routes/${this.pathKey}.png`
    },
    staticTitle () {
      return `${this.routeName} • ${this.routeType} route`
    },
    staticDescription () {
      return `${this.routeName} is a ${this.routeType} route available for browsing and analyzing on the Transitland platform.`
    }
  },
  methods: {
    filterRTTranslations (v) {
      return v.filter((s) => { return !s.language.includes('html') })
    }
  }
}
</script>
