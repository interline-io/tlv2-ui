<template>
  <div>
    <div v-if="loading" class="is-loading" />
    <div v-else-if="entity">
      <slot name="title">
        <tl-title :title="staticTitle" :description="staticDescription">
          {{ operatorName }}
        </tl-title>
      </slot>

      <!-- Warnings for freshness and viewing a specific version -->
      <tl-check-fresh :fetched="dataFreshness" />
      <tl-check-single :feed-onestop-id="searchKey.feedOnestopId" :feed-version-sha1="searchKey.feedVersionSha1" />

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
                    <li v-for="(location, index) of locations" :key="index">
                      <nuxt-link :to="{ name: 'places-adm0', params: { adm0: location.adm0_name } }">
                        {{ location.adm0_name }}
                      </nuxt-link>
                      <template v-if="location.adm1_name">
                        /
                        <nuxt-link :to="{ name: 'places-adm0-adm1', params: { adm1: location.adm1_name, adm0: location.adm0_name } }">
                          {{ location.adm1_name }}
                        </nuxt-link>
                      </template>
                      <template v-if="location.city_name">
                        /
                        <nuxt-link :to="{ name: 'places-adm0-adm1-city', params: { city: location.city_name, adm1: location.adm1_name, adm0: location.adm0_name } }">
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
            <tr v-for="(row, index) of sources" :key="index">
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
                <template v-else-if="row.target_feed_spec == 'GTFS'">
                  <o-tooltip label="The active version of this source feed does not contain a matching agency">
                    <o-icon icon="alert" />
                  </o-tooltip>
                </template>
              </td>
              <td class="has-text-right">
                <nuxt-link class="button is-small is-primary" :to="{ name: 'feeds-feedKey', params: { feedKey: row.target_feed } }">
                  Feed
                </nuxt-link> <nuxt-link v-if="row.target_feed_spec == 'GTFS'" class="button is-small is-primary" :to="{ name: 'feeds-feedKey', params: { feedKey: row.target_feed }, hash: '#versions' }">
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
              :feed-version-ids="agencies.map((a: Agency) => a.feed_version.id)"
              :agency-ids="agencyIds"
            />
          </o-tab-item>
        </o-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Operator Page Component
 *
 * This component displays detailed information about a transit operator,
 * including agencies, feeds, routes, stops, and geographic coverage.
 */
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { computed, ref } from 'vue'
import { useEntityPath } from '../../composables/useEntityPath'

// Type definitions
interface OperatorResponse {
  id: number
  onestop_id: string
  generated?: boolean
  file?: string
  name?: string
  short_name?: string
  website?: string
  tags?: Record<string, string>
  feeds: {
    onestop_id: string
    spec: string
  }[]
  agencies: {
    id: number
    feed_version_sha1?: string
    feed_onestop_id?: string
    agency_id: string
    agency_name: string
    agency_url?: string
    agency_phone?: string
    feed_version: {
      id: number
      fetched_at: string
      feed: {
        id: number
        onestop_id: string
        spec: string
      }
    }
    places: {
      city_name?: string
      adm0_name?: string
      adm1_name?: string
      rank?: number
    }[]
  }[]
}

// Extract individual types from the response type
type Operator = OperatorResponse
type Agency = OperatorResponse['agencies'][0]
type Place = Agency['places'][0]

interface QueryVariables {
  onestopId?: string
  feedOnestopId?: string
  limit?: number
}

interface Source {
  target_type: string
  target_feed?: string
  target_feed_spec?: string
  target_match?: Agency
}

const props = withDefaults(defineProps<{
  pathKey?: string
  feedVersionSha1?: string
  feedOnestopId?: string
  entityId?: string
}>(), {
  pathKey: undefined,
  feedVersionSha1: undefined,
  feedOnestopId: undefined,
  entityId: undefined
})

// Reactive data
const activeTab = ref('map')

// Tab names
const tabNames = computed(() => {
  const tabs = ['map', 'routes', 'stops', 'export']
  const result: Record<string, string> = {}
  for (const tab of tabs) {
    result[tab] = tab
  }
  return result
})

// Use entity path composable for route parsing and entity logic
const { searchKey, entityVariables, linkVersion } = useEntityPath(props)

// GraphQL query
const operatorQuery = gql`
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

// Apollo query
const { result, loading } = useQuery<{ entities: OperatorResponse[] }, QueryVariables>(
  operatorQuery,
  () => entityVariables.value,
  {
    clientId: 'transitland'
  }
)
// Computed properties
const entities = computed<Operator[]>(() => result.value?.entities ?? [])

const entity = computed<Operator | null>(() => {
  return entities.value.length > 0 && entities.value[0] ? entities.value[0] : null
})

const agencies = computed<Agency[]>(() => {
  return entity.value?.agencies ?? []
})

const dataFreshness = computed<string | null>(() => {
  if (agencies.value.length > 0) {
    const sorted = agencies.value.map(a => a.feed_version.fetched_at).sort((a, b) => new Date(a) < new Date(b) ? 1 : -1)
    return sorted[0] ?? null
  }
  return null
})

const locations = computed<Place[]>(() => {
  const ret = new Map<string, Place>()
  for (const ent of agencies.value) {
    if (!ent) { continue }
    for (const p of ent.places || []) {
      const key = `${p.adm0_name} / ${p.adm1_name} - ${p.city_name}`
      ret.set(key, p)
    }
  }
  return Array.from(ret.values()).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
})

const agencyIds = computed<number[]>(() => {
  return agencies.value.map(s => s.id).filter(s => s)
})

const agencyNames = computed<string[]>(() => {
  return [...new Set(agencies.value.map(s => s.agency_name))]
})

const agencyURLs = computed<string[]>(() => {
  const urls = agencies.value.map(s => s.agency_url).filter((url): url is string => Boolean(url))
  if (entity.value && entity.value.website) {
    urls.push(entity.value.website)
  }
  return [...new Set(urls)] // remove duplicates
})

const _generatedOperator = computed<boolean>(() => {
  return entity.value ? entity.value.generated === true : false
})

const operatorName = computed<string>(() => {
  if (entity.value && entity.value.name && entity.value.short_name) {
    return `${entity.value.name} (${entity.value.short_name})`
  } else if (entity.value && (entity.value.name || entity.value.short_name)) {
    return entity.value.name || entity.value.short_name || ''
  } else if (agencies.value && agencies.value.length > 0 && agencies.value[0]) {
    return agencies.value[0].agency_name
  } else {
    return ''
  }
})

const sources = computed<Source[]>(() => {
  const ret: Source[] = []
  const matchedFeeds: Record<string, boolean> = {}
  if (!entity.value) {
    return ret
  }
  for (const agency of agencies.value) {
    ret.push({
      target_type: 'Associated Feed',
      target_feed: agency.feed_version.feed.onestop_id,
      target_feed_spec: agency.feed_version.feed.spec.toUpperCase(),
      target_match: agency
    })
    matchedFeeds[agency.feed_version.feed.onestop_id] = true
  }
  if (entity.value) {
    for (const oif of entity.value.feeds || []) {
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
})

const uniqueFeedSourcesOnestopIds = computed<Record<string, string>>(() => {
  const onestopIdsToSpec: Record<string, string> = {}
  sources.value.forEach((s) => {
    if (s.target_feed && s.target_feed_spec) {
      onestopIdsToSpec[s.target_feed] = s.target_feed_spec.toUpperCase()
    }
  })
  return onestopIdsToSpec
})

const _feedCounts = computed<number>(() => {
  return Object.keys(uniqueFeedSourcesOnestopIds.value).length
})

const staticTitle = computed<string>(() => {
  return `${operatorName.value} • Operator details`
})

const staticDescription = computed<string>(() => {
  const gtfsCount = sources.value.filter(s => s.target_feed_spec === 'GTFS').length
  const gtfsRtCount = sources.value.filter(s => s.target_feed_spec === 'GTFS_RT').length
  let feedCounts = `${gtfsCount} GTFS feed${gtfsCount > 1 ? 's' : ''}`
  if (gtfsRtCount > 0) {
    feedCounts += ` and ${gtfsRtCount} GTFS Realtime feed${gtfsRtCount > 1 ? 's' : ''}`
  }
  const locationsList = locations.value
    .map(l => [l.adm0_name, l.adm1_name, l.city_name].filter(Boolean).join(', '))
    .join('; ')
  return `Data for ${operatorName.value} is sourced from ${feedCounts}. ${operatorName.value} provides transit services in the following locations: ${locationsList}.`
})

// Methods
function formatSpec (raw?: string): string {
  if (raw === 'GTFS_RT') {
    return 'GTFS Realtime'
  } else {
    return raw || ''
  }
}

function setTab (value: string): void {
  activeTab.value = value
}

// JSON-LD schema for SEO (for use in www-transit-land-v2)
function _jsonld (): Record<string, any> {
  if (!entity.value) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Transit Operator',
      'description': 'Transit operator information'
    }
  }

  // Get website URLs
  const sameAs: string[] = []
  if (entity.value.website) {
    sameAs.push(entity.value.website)
  }

  // Add agency URLs
  if (entity.value.agencies) {
    entity.value.agencies.forEach((agency) => {
      if (agency.agency_url && !sameAs.includes(agency.agency_url)) {
        sameAs.push(agency.agency_url)
      }
    })
  }

  // Add Wikidata URL if available
  if (entity.value.tags && entity.value.tags.wikidata_id) {
    const wikidataUrl = `https://www.wikidata.org/wiki/${entity.value.tags.wikidata_id}`
    if (!sameAs.includes(wikidataUrl)) {
      sameAs.push(wikidataUrl)
    }
  }

  // Create areaServed from locations data using specific Schema.org types
  const areaServed: Array<Record<string, string>> = []
  if (locations.value && locations.value.length > 0) {
    locations.value.forEach((location) => {
      // Create individual administrative areas based on available data
      if (location.adm0_name) {
        areaServed.push({
          '@type': 'Country',
          'name': location.adm0_name
        })
      }

      if (location.adm1_name) {
        areaServed.push({
          '@type': 'State',
          'name': location.adm1_name
        })
      }

      if (location.city_name) {
        areaServed.push({
          '@type': 'City',
          'name': location.city_name
        })
      }
    })
  }

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': operatorName.value,
    'description': staticDescription.value,
    'identifier': entity.value.onestop_id
  }

  if (sameAs.length > 0) {
    schema.sameAs = sameAs
  }

  if (areaServed.length > 0) {
    schema.areaServed = areaServed
  }

  // Add telephone if available
  const phoneNumbers = agencies.value
    .map(agency => agency.agency_phone)
    .filter(phone => phone && phone.trim())

  if (phoneNumbers.length > 0) {
    // Use the first available phone number
    schema.telephone = phoneNumbers[0]
  }

  return schema
}
</script>
