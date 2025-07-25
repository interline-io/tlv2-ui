<template>
  <div>
    <div v-if="$apollo.loading" class="is-loading" />
    <div v-else-if="entity">
      <slot name="title">
        <tl-title :title="staticTitle" :description="staticDescription">
          {{ operatorName }}
        </tl-title>
      </slot>

      <!-- Warnings for freshness and viewing a specific version -->
      <tl-check-fresh :fetched="dataFreshness" />
      <tl-check-single :feed-onestop-id="feedOnestopId" :feed-version-sha1="feedVersionSha1" />

      <!-- Main content -->
      <div class="columns">
        <div class="column is-three-quarters">
          <tl-props>
            <tbody>
              <tr>
                <td>
                  <o-tooltip label="A globally unique identifier for this operator">
                    Onestop ID
                  </o-tooltip>
                </td>
                <td><tl-safelink :text="searchKey.onestopId" /></td>
              </tr>
              <tr>
                <td>
                  <o-tooltip multiline label="Matched agencies; see 'Sources Feed(s)' below for full details">
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
                  <o-tooltip multiline label="Operators and their service areas are matched against place names from the Natural Earth project">
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
                  {{ agencyURLs.length > 1 ? 'Websites' : 'Website' }}
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
                  <o-tooltip multiline label="Links between this data and other catalogs and data sources on the Internet">
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
            </tbody>
          </tl-props>

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
                  <o-tooltip label="The active version of this source feed does not contain a matching agency">
                    <o-icon icon="alert" />
                  </o-tooltip>
                </template>
              </td>
              <td class="has-text-right">
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

      <div v-if="agencyIds.length > 0">
        <h4 class="title is-4">
          Operator Service
        </h4>
        <o-tabs v-model="activeTab" class="tl-tabs" type="boxed" :animated="false" @update:model-value="setTab">
          <o-tab-item :value="tabNames.map" label="Map">
            <client-only placeholder="Map">
              <tl-feed-version-map-viewer
                v-if="activeTab === tabNames.map"
                :agency-ids="agencyIds"
                :overlay="true"
                :link-version="linkVersion"
              />
            </client-only>
          </o-tab-item>

          <o-tab-item :value="tabNames.routes" label="Routes">
            <tl-route-table v-if="activeTab === tabNames.routes" :agency-ids="agencyIds" :show-agency="true" />
          </o-tab-item>

          <o-tab-item :value="tabNames.stops" label="Stops">
            <tl-stop-table
              v-if="activeTab === tabNames.stops"
              :show-onestop-id="true"
              :feed-version-ids="agencies.map(a => a.feed_version.id)"
              :agency-ids="agencyIds"
            />
          </o-tab-item>
        </o-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'
import EntityPageMixin from './entity-page-mixin'
import { useEventBus } from '#imports'


const q = gql`
query ($onestopId: String, $feedOnestopId: String, $limit: Int=10) {
  entities: operators(limit: $limit, where: {feed_onestop_id: $feedOnestopId, onestop_id: $onestopId, merged: true}) {
    id
    onestop_id
    generated
    file
    name
    short_name
    website
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
  data () {
    return {
      features: [],
      tabNames: this.makeTabNames(['map', 'routes', 'stops', 'export']),
      activeTab: 'map'
    }
  },
  computed: {
    dataFreshness () {
      if (this.agencies.length > 0) {
        return this.agencies.map(a => a.feed_version.fetched_at).sort((a, b) => new Date(a) < new Date(b))[0]
      }
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
      const urls = this.agencies.map((s) => { return s.agency_url })
      if (this.entity && this.entity.website) {
        urls.push(this.entity.website)
      }
      return [...new Set(urls)] // remove duplicates
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
      return `Data for ${this.operatorName} is sourced from ${feedCounts}. ${this.operatorName} provides transit services in the following locations: ${locations}.`
    }
  },
  watch: {
    'entity.name' (v) {
      useEventBus().$emit('setParamKey', 'operatorKey', v)
    }
  },
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
  methods: {
    formatSpec (raw) {
      if (raw === 'GTFS_RT') {
        return 'GTFS Realtime'
      } else {
        return raw
      }
    }
  },
  // for use in www-transit-land-v2 (which has nuxt-jsonld NPM package)
  jsonld () {
    if (!this.entity) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Transit Operator',
        description: 'Transit operator information',
      }
    }

    // Get website URLs
    const sameAs = []
    if (this.entity.website) {
      sameAs.push(this.entity.website)
    }
    
    // Add agency URLs
    if (this.entity.agencies) {
      this.entity.agencies.forEach(agency => {
        if (agency.agency_url && !sameAs.includes(agency.agency_url)) {
          sameAs.push(agency.agency_url)
        }
      })
    }

    // Add Wikidata URL if available
    if (this.entity.tags && this.entity.tags.wikidata_id) {
      const wikidataUrl = `https://www.wikidata.org/wiki/${this.entity.tags.wikidata_id}`
      if (!sameAs.includes(wikidataUrl)) {
        sameAs.push(wikidataUrl)
      }
    }

    // Create areaServed from locations data using specific Schema.org types
    const areaServed = []
    if (this.locations && this.locations.length > 0) {
      this.locations.forEach(location => {
        // Create individual administrative areas based on available data
        if (location.adm0_name) {
          areaServed.push({
            '@type': 'Country',
            name: location.adm0_name
          })
        }
        
        if (location.adm1_name) {
          areaServed.push({
            '@type': 'State',
            name: location.adm1_name
          })
        }
        
        if (location.city_name) {
          areaServed.push({
            '@type': 'City',
            name: location.city_name
          })
        }
      })
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.operatorName,
      description: this.staticDescription,
      identifier: this.entity.onestop_id
    }

    if (sameAs.length > 0) {
      schema.sameAs = sameAs
    }

    if (areaServed.length > 0) {
      schema.areaServed = areaServed
    }

    // Add telephone if available
    const phoneNumbers = this.agencies
      .map(agency => agency.agency_phone)
      .filter(phone => phone && phone.trim())
    
    if (phoneNumbers.length > 0) {
      // Use the first available phone number
      schema.telephone = phoneNumbers[0]
    }

    return schema
  }
}
</script>
