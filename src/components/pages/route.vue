<template>
  <div>
    <div v-if="$apollo.loading" class="is-loading" />
    <div v-else-if="entity">
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
                :to="{
                  name: 'operators-onestop_id',
                  params: { onestop_id: entity.agency.onestop_id || 'ok' },
                }"
              >
                {{ entity.agency.agency_name }}
              </nuxt-link>
            </li>
            <li>
              <nuxt-link
                :to="{
                  name: 'routes-onestop_id',
                  params: { onestop_id: pathKey },
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

      <h1 v-for="ent of routeNames" :key="ent.id" class="title">
        {{ ent.agency.agency_name }} <br>
        <tl-route-icon
          :route-link="ent.route_url"
          :route-type="ent.route_type"
          :route-short-name="ent.route_short_name"
          :route-long-name="ent.route_long_name"
        />
      </h1>

      <!-- Warnings for freshness and viewing a specific version -->
      <div class="block">
        <b-message v-if="dataFreshness > 365" type="is-warning" has-icon>
          The GTFS feeds associated with this page were fetched
          {{ dataFreshness }} days ago; use caution or check if newer data is
          available.
        </b-message>

        <b-message v-if="linkVersion" type="is-warning" has-icon>
          You are viewing a single GTFS Route entity defined in source feed
          <nuxt-link
            :to="{
              name: 'feeds-feed',
              params: { feed: feedOnestopId },
            }"
          >
            {{ $filters.shortenName(feedOnestopId) }}
          </nuxt-link>
          version
          <nuxt-link
            :to="{
              name: 'feeds-feed-versions-version',
              params: {
                feed: feedOnestopId,
                version: feedVersionSha1,
              },
            }"
          >
            {{ $filters.shortenName(feedVersionSha1, 8) }}
          </nuxt-link>.<br>
          <template v-if="!search">
            Click
            <nuxt-link
              :to="{
                name: 'routes-onestop_id',
                params: { onestop_id: searchKey.onestop_id },
              }"
            >
              here
            </nuxt-link>
            to return to the main view.
          </template>
        </b-message>
      </div>

      <!-- Main content -->
      <div class="columns">
        <div class="column is-two-thirds">
          <table class="table is-borderless property-list">
            <tr v-if="entity.onestop_id">
              <td>
                <b-tooltip
                  dashed
                  label="A globally unique identifier for this route"
                >
                  Onestop ID
                </b-tooltip>
              </td>
              <td>{{ entity.onestop_id }}</td>
            </tr>
            <tr v-if="entity.agency">
              <td>Operated by</td>
              <td>
                <nuxt-link
                  :to="{
                    name: 'operators-onestop_id',
                    params: { onestop_id: entity.agency.onestop_id || 'ok' },
                  }"
                >
                  {{ entity.agency.agency_name }}
                </nuxt-link>
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
                <b-tooltip
                  dashed
                  :label="`Route with route_type = ${entity.route_type}`"
                >
                  {{ $filters.routeTypeToWords(entity.route_type) }}
                </b-tooltip>
              </td>
            </tr>
            <tr v-if="entity.route_url">
              <td>URL</td>
              <td>
                {{ entity.route_url }}
                <a
                  :href="entity.route_url"
                  target="_blank"
                ><b-icon
                  icon="link"
                /></a>
              </td>
            </tr>
            <tr>
              <td>GTFS ID</td>
              <td>
                {{ entity.route_id }}
              </td>
            </tr>
            <tr v-if="entity.entity_desc">
              <td>Description</td>
              <td>
                {{ entity.entity_desc }}
              </td>
            </tr>
          </table>

          <div v-for="ent of entities" :key="ent.id">
            <b-message
              v-for="(alert,idx) of ent.alerts"
              :key="idx"
              type="is-warning"
              class="block"
              has-icon
            >
              <div v-for="tr of filterRTTranslations(alert.description_text)" :key="tr.text">
                Agency Alert: {{ tr.text }}
              </div>
            </b-message>
          </div>

          <br>
          <b-message type="is-info" class="block">
            Learn more about the contents of <code>routes.txt</code> on
            <a
              href="https://gtfs.org/reference/static#routestxt"
              target="_blank"
            >gtfs.org</a>.
          </b-message>

          <b-tabs
            v-model="activeTab"
            type="is-boxed"
            :animated="false"
            @input="setTab"
          >
            <b-tab-item label="Connections">
              <client-only>
                <tl-rsp-viewer v-if="activeTab === 1" :route-ids="entityIds" />
              </client-only>
            </b-tab-item>
            <b-tab-item label="Headways">
              <tl-headway-viewer :headways="entity.headways" />
            </b-tab-item>

            <!-- Data sources -->
            <b-tab-item label="Sources">
              <o-table :data="entities" :striped="true">
                <o-table-column
                  v-slot="props"
                  field="feed_onestop_id"
                  label="Feed"
                >
                  <nuxt-link
                    :to="{
                      name: 'feeds-feed',
                      params: { feed: props.row.feed_onestop_id },
                    }"
                  >
                    {{ $filters.shortenName(props.row.feed_onestop_id) }}
                  </nuxt-link>
                </o-table-column>
                <o-table-column
                  v-slot="props"
                  field="feed_version_sha1"
                  label="Version"
                >
                  <nuxt-link
                    :to="{
                      name: 'feeds-feed-versions-version',
                      params: {
                        feed: props.row.feed_onestop_id,
                        version: props.row.feed_version_sha1,
                      },
                    }"
                  >
                    {{ $filters.shortenName(props.row.feed_version_sha1, 8) }}
                  </nuxt-link>
                </o-table-column>
                <o-table-column
                  v-slot="props"
                  field="route_id"
                  label="Route ID"
                >
                  <nuxt-link
                    :to="{
                      name: 'routes-onestop_id',
                      params: { onestop_id: props.row.onestop_id },
                      query: {
                        feed_onestop_id: props.row.feed_onestop_id,
                        feed_version_sha1: props.row.feed_version_sha1,
                        route_id: props.row.route_id,
                      },
                    }"
                  >
                    {{ $filters.shortenName(props.row.route_id) }}
                  </nuxt-link>
                </o-table-column>
              </o-table>
            </b-tab-item>

            <b-tab-item label="Export">
              <client-only placeholder="Export">
                <tl-data-export
                  v-if="activeTab === 4"
                  :route-name="routeName"
                  :route-features="routeFeatures"
                  :stop-features="stopFeatures"
                  :route-ids="[entity.id]"
                  @setFeatures="features = $event"
                />
              </client-only>
            </b-tab-item>
          </b-tabs>
        </div>
        <div class="column is-one-third">
          <client-only>
            <tl-feed-version-map-viewer
              :route-ids="entityIds"
              :overlay="false"
              :include-stops="true"
              :link-version="linkVersion"
              :features="activeTab === 4 ? features : []"
            />
          </client-only>
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
query ($onestop_id: String, $ids: [Int!], $entity_id: String, $feed_onestop_id: String, $feed_version_sha1: String, $include_stops: Boolean! = true) {
  entities: routes(limit: 100, ids: $ids, where: {onestop_id: $onestop_id, feed_onestop_id: $feed_onestop_id, feed_version_sha1: $feed_version_sha1, route_id: $entity_id}) {
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
  mixins: [EntityPageMixin, Filters],
  data () {
    return {
      features: [],
      bufferGeom: null,
      routeGeom: null,
      censusGeoms: null,
      selectDate: null,
      tabIndex: {
        0: 'summary',
        1: 'headways',
        2: 'sources',
        3: 'export'
      }
    }
  },
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
  head () {
    if (this.entity) {
      return {
        title: this.staticTitle,
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: this.staticDescription
          },
          {
            hid: 'twitter:card',
            name: 'twitter:card',
            content: 'summary'
          },
          {
            hid: 'twitter:site',
            name: 'twitter:site',
            content: '@transitland'
          },
          {
            hid: 'twitter:title',
            name: 'twitter:title',
            content: this.staticTitle
          },
          {
            hid: 'twitter:description',
            name: 'twitter:description',
            content: this.staticDescription
          },
          {
            hid: 'twitter:image',
            name: 'twitter:image',
            content: this.staticImage
          },
          {
            hid: 'twitter:image:alt',
            name: 'twitter:image:alt',
            content: this.staticTitle
          },
          {
            hid: 'og:title',
            property: 'og:title',
            content: this.staticTitle
          },
          {
            hid: 'og:description',
            property: 'og:description',
            content: this.staticDescription
          },
          {
            hid: 'og:image',
            property: 'og:image',
            content: this.staticImage
          },
          {
            hid: 'og:image:alt',
            property: 'og:image:alt',
            content: this.staticTitle
          },
          {
            hid: 'og:image:type',
            property: 'og:image:type',
            content: 'image/png'
          },
          {
            hid: 'og:image:width',
            property: 'og:image:width',
            content: '800'
          },
          {
            hid: 'og:image:height',
            property: 'og:image:height',
            content: '600'
          }
        ]
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
      if (this.entity) {
        return this.$options.filters.routeTypeToWords(this.entity.route_type)
      } else {
        return ''
      }
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
      return `https://transit.land/api/v2/rest/routes/${this.searchKey.onestop_id}.png`
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
