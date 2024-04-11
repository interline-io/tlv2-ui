<template>
  <div>
    <div v-if="$apollo.loading" class="is-loading" />
    <div v-else-if="entity">
      <Meta name="description" :content="staticDescription" />
      <Meta name="twitter:title" :content="staticTitle" />
      <Meta name="twitter:description" :content="staticDescription" />
      <Meta name="og:title" :content="staticTitle" />
      <Meta name="og:description" :content="staticDescription" />

      <nav class="breadcrumb">
        <ul>
          <li>
            <nuxt-link :to="{name:'operators'}">
              Operators
            </nuxt-link>
          </li><li>
            <nuxt-link :to="{name:'operators-operatorKey', params:{operatorKey:$route.params.operatorKey}}">
              {{ operatorName }}
            </nuxt-link>
          </li>
        </ul>
      </nav>

      <tl-title :title="staticTitle">
        {{ operatorName }}
      </tl-title>

      <!-- Warnings for freshness and viewing a specific version -->
      <tl-check-fresh :fetched="dataFreshness" />
      <tl-check-single :feed-onestop-id="feedOnestopId" :feed-version-sha1="feedVersionSha1" />

      <!-- Main content -->
      <div class="columns">
        <div class="column is-three-quarters">
          <table class="table is-borderless property-list tl-props">
            <tr>
              <td>
                <o-tooltip dashed label="A globally unique identifier for this operator">
                  Onestop ID
                </o-tooltip>
              </td>
              <td><tl-safelink :text="searchKey.onestop_id" /></td>
            </tr>
            <tr>
              <td>
                <o-tooltip dashed multiline label="Matched agencies; see 'Sources Feed(s)' below for full details">
                  Agencies
                </o-tooltip>
              </td>
              <td>
                <ul>
                  <li v-for="k of agencyNames" :key="k">
                    {{ k }}
                  </li>
                </ul>
              </td>
            </tr>
            <tr>
              <td>
                <o-tooltip dashed multiline label="Operators and their service areas are matched against place names from the Natural Earth project">
                  Locations
                </o-tooltip>
              </td>
              <td>
                <ul>
                  <li v-for="location of locations" :key="location.name">
                    <nuxt-link :to="{name:'places-adm0', params:{adm0: location.adm0_name}}">
                      {{ location.adm0_name }}
                    </nuxt-link>
                    <template v-if="location.adm1_name">
                      /
                      <nuxt-link :to="{name:'places-adm0-adm1', params:{adm1: location.adm1_name, adm0: location.adm0_name}}">
                        {{ location.adm1_name }}
                      </nuxt-link>
                    </template>
                    <template v-if="location.city_name">
                      /
                      <nuxt-link :to="{name:'places-adm0-adm1-city', params:{city: location.city_name, adm1: location.adm1_name, adm0: location.adm0_name}}">
                        {{ location.city_name }}
                      </nuxt-link>
                    </template>
                  </li>
                </ul>
              </td>
            </tr>
            <tr>
              <td>
                Contact
              </td>
              <td>
                <ul>
                  <li v-for="k of agencyURLs" :key="k">
                    <tl-safelink :url="k" />
                  </li>
                </ul>
              </td>
            </tr>
            <tr v-if="entity && entity.tags && Object.keys(entity.tags).length > 0">
              <td>
                <o-tooltip dashed multiline label="Links between Transitland and other catalogs and data sources on the Internet">
                  ID Crosswalk
                </o-tooltip>
              </td>
              <td>
                <ul>
                  <li v-if="entity.tags.us_ntd_id">
                    US National Transit Database (NTD) ID: <tl-safelink :text="entity.tags.us_ntd_id" url="https://www.transit.dot.gov/ntd/" />
                  </li>
                  <li v-if="entity.tags.omd_provider_id">
                    OpenMobilityData Provider ID: <tl-safelink :text="entity.tags.omd_provider_id" :url="`https://openmobilitydata.org/p/${entity.tags.omd_provider_id}`" />
                  </li>
                  <li v-if="entity.tags.wikidata_id">
                    Wikidata Entity ID:
                    <tl-safelink :text="entity.tags.wikidata_id" :url="`https://www.wikidata.org/wiki/${entity.tags.wikidata_id}`" />
                  </li>
                </ul>
              </td>
            </tr>
          </table>

          <slot name="description">
            <div class="content">
              {{ staticDescription }}
            </div>
          </slot>
        </div>

        <slot name="edit-operator" :entity="entity" />
      </div>

      <hr>
      <h4 class="title is-4">
        Source Feed(s)
      </h4>

      <slot name="contentBeforeTable" :entity="entity" />

      <div class="table-container">
        <table class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Source feed Onestop ID</th>
              <th>Source spec</th>
              <th>Association type</th>
              <th>Matched GTFS agency</th>
              <th class="has-text-right">
                Links to view
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row of sources" :key="row.id">
              <td>
                <tl-safelink :text="row.target_feed" />
              </td>
              <td>
                {{ formatSpec(row.target_feed_spec) }}
              </td>
              <td>
                {{ row.target_type }}
              </td>
              <td>
                <template v-if="row.target_match">
                  <o-icon icon="check" />
                  {{ row.target_match.agency_name }}
                </template>
                <template v-else-if="row.feed_spec == 'GTFS'">
                  <o-tooltip dashed label="The active version of this source feed does not contain a matching agency">
                    <o-icon icon="alert" />
                  </o-tooltip>
                </template>
              </td>
              <td class="has-text-right" style="min-width: 250px;">
                <nuxt-link class="button is-small is-primary" :to="{name:'feeds-feedKey', params:{feedKey:row.target_feed}}">
                  Feed
                </nuxt-link> <nuxt-link v-if="row.target_feed_spec == 'GTFS'" class="button is-small is-primary" :to="{name:'feeds-feedKey', params:{feedKey: row.target_feed}, hash: '#versions'}">
                  Archived feed versions
                </nuxt-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr>

      <!-- anchors for when users click between tabs -->
      <div v-if="agencyIds.length > 0">
        <a v-for="[, value] of Object.entries(tabIndex)" :key="value" :name="value" />
        <h4 class="title is-4">
          Operator Service
        </h4>
        <o-tabs v-model="activeTab" class="tl-tabs" type="boxed" :animated="false" @update:model-value="setTab">
          <o-tab-item id="map" label="Map">
            <client-only placeholder="Map">
              <tl-feed-version-map-viewer
                v-if="activeTab === 1"
                :agency-ids="agencyIds"
                :overlay="true"
                :link-version="linkVersion"
              />
            </client-only>
          </o-tab-item>

          <o-tab-item id="routes" label="Routes">
            <tl-route-table v-if="activeTab === 2" :agency-ids="agencyIds" :show-agency="true" />
          </o-tab-item>

          <o-tab-item id="stops" label="Stops">
            <tl-stop-table v-if="activeTab === 3" :agency-ids="agencyIds" />
          </o-tab-item>
        </o-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import EntityPageMixin from './entity-page-mixin'

const q = gql`
query ($onestop_id: String, $feed_onestop_id: String, $limit: Int=10) {
  entities: operators(limit: $limit, where: {feed_onestop_id: $feed_onestop_id, onestop_id: $onestop_id, merged: true}) {
    id
    onestop_id
    generated
    file
    name
    short_name
    tags
    feeds {
      onestop_id
      spec
    }
    agencies {
      id
      feed_version_sha1
      feed_onestop_id
      agency_id
      agency_name
      agency_url
      agency_phone
      feed_version {
        id
        fetched_at
        feed {
          id
          onestop_id
          spec
        }
      }
      places(where: {min_rank: 0.2}) {
        city_name
        adm0_name
        adm1_name
      }
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
      // skip () { return this.checkSearchSkip(this.$route.query.agency_id) }, // skip if search and no agency_id
      variables () {
        return this.searchKey
      }
    }
  },
  data () {
    return {
      features: [],
      tabIndex: {
        1: 'map',
        2: 'routes',
        3: 'stops',
        4: 'export'
      }
    }
  },
  computed: {
    dataFreshness () {
      if (this.agencies.length > 0) { return this.agencies[0].feed_version.fetched_at }
      return null
    },
    locations () {
      const ret = new Map()
      for (const ent of this.agencies) {
        if (!ent) { continue }
        for (const p of ent.places || []) {
          const key = `${p.adm0_name} / ${p.adm1_name} - ${p.city_name}`
          ret.set(key, p)
        }
      }
      return Array.from(ret.values()).sort(function (a, b) { return a.rank - b.rank })
    },
    agencies () {
      return (this.entity || {}).agencies || []
    },
    agencyIds () {
      return this.agencies.map((s) => { return s.id }).filter((s) => { return s })
    },
    agencyNames () {
      return [...new Set(this.agencies.map((s) => { return s.agency_name }))]
    },
    agencyURLs () {
      return [...new Set(this.agencies.map((s) => { return s.agency_url }))]
    },
    generatedOperator () {
      return this.entity && this.entity.generated
    },
    operatorName () {
      if (this.entity && this.entity.name && this.entity.short_name) {
        return `${this.entity.name} (${this.entity.short_name})`
      } else if (this.entity && (this.entity.name || this.entity.short_name)) {
        return this.entity.name || this.entity.short_name
      } else if (this.agencies && this.agencies.length > 0) {
        return this.agencies[0].agency_name
      } else {
        return ''
      }
    },
    sources () {
      const ret = []
      const matchedFeeds = {}
      if (!this.entity) {
        return ret
      }
      for (const agency of this.agencies) {
        ret.push({
          target_type: 'Associated Feed',
          target_feed: agency.feed_version.feed.onestop_id,
          target_feed_spec: agency.feed_version.feed.spec.toUpperCase(),
          target_match: agency
        })
        matchedFeeds[agency.feed_version.feed.onestop_id] = true
      }
      if (this.entity) {
        for (const oif of this.entity.feeds || []) {
          const fid = oif.onestop_id
          if (!matchedFeeds[fid]) {
            ret.push({
              target_type: 'Associated Feed',
              target_feed: fid,
              target_feed_spec: oif.spec.toUpperCase()
            })
          }
        }
      }
      if (ret.length === 0) {
        ret.push({
          target_type: 'No Associations'
        })
      }
      return ret
    },
    uniqueFeedSourcesOnestopIds () {
      const onestopIdsToSpec = {}
      this.sources.forEach((s) => {
        onestopIdsToSpec[s.target_feed] = s.target_feed_spec.toUpperCase()
      })
      return onestopIdsToSpec
    },
    feedCounts () {
      return Object.keys(this.uniqueFeedSourcesOnestopIds).length
    },
    staticTitle () {
      return `${this.operatorName} • Operator details`
    },
    staticDescription () {
      const gtfsCount = this.sources.filter(s => s.target_feed_spec === 'GTFS').length
      const gtfsRtCount = this.sources.filter(s => s.target_feed_spec === 'GTFS_RT').length
      let feedCounts = `${gtfsCount} GTFS feed${gtfsCount > 1 ? 's' : ''}`
      if (gtfsRtCount > 0) {
        feedCounts += ` and ${gtfsRtCount} GTFS Realtime feed${gtfsRtCount > 1 ? 's' : ''}`
      }
      const locations = this.locations
        .map(l => [l.adm0_name, l.adm1_name, l.city_name].filter(Boolean).join(', '))
        .join('; ')
      return `${this.operatorName} is an operator listed on the Transitland open data platform. Transitland sources data for this operator from ${feedCounts}. ${this.operatorName} provides transit services in the following locations: ${locations}.`
    }
  },
  methods: {
    formatSpec (raw) {
      if (raw === 'GTFS_RT') {
        return 'GTFS Realtime'
      } else {
        return raw
      }
    }
  }
}
</script>
