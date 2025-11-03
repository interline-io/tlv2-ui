<!--
Usage example:
<tl-pages-route
  :path-key="$route.params.routeKey"
  :include-stops="true"
  @entities-loaded="entitiesLoaded"
  @static-description-updated="staticDescriptionUpdated"
  @route-name-updated="routeNameUpdated"
/>
-->

<template>
  <div>
    <tl-loading v-if="loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="entity">
      <slot name="title">
        <tl-title :title="staticTitle" :description="staticDescription">
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
        <Meta name="og:image:type" content="image/png" />
        <Meta name="og:image:width" content="800" />
        <Meta name="og:image:height" content="600" />
        <Meta name="og:image" :content="staticImage" />
        <Meta name="og:image:alt" :content="staticDescription" />
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
              <tr v-if="entity.onestop_id">
                <td>
                  <o-tooltip
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
                    :label="`Route with route_type = ${entity.route_type}`"
                  >
                    {{ routeTypeToWords(entity.route_type) }}
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
          </tl-props>

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
            <o-tab-item :value="tabNames.summary" label="Connections">
              <client-only placeholder="Service patterns">
                <tl-rsp-viewer :route-ids="entityIds" :link-version="linkVersion" />
              </client-only>
            </o-tab-item>

            <o-tab-item :value="tabNames.headways" label="Headways">
              <tl-headway-viewer :headways="entity.headways" />
            </o-tab-item>

            <!-- Data sources -->
            <o-tab-item :value="tabNames.sources" label="Source feed(s)">
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
                        <tl-safelink :text="shortenName(row.route_id, 20)" />
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
                          :to="makeRouteLink(row.onestop_id,row.feed_onestop_id,row.feed_version_sha1,row.route_id,row.id,true)"
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

            <o-tab-item :value="tabNames.export" label="Export">
              <client-only placeholder="Export">
                <tl-login-gate role="tl_user">
                  <tl-data-export
                    v-if="activeTab === tabNames.export"
                    :route-name="routeName"
                    :route-features="routeFeatures"
                    :stop-features="stopFeatures"
                    :route-ids="[entity.id]"
                    @set-features="features = $event"
                  />
                  <template #loginText>
                    <o-notification icon="lock">
                      To export this route geometry and stop locations as GeoJSON, please sign into an Interline account with a Transitland subscription.
                    </o-notification>
                  </template>
                  <template #roleText>
                    <o-notification icon="lock">
                      Your account does not have permission to export route geometries. Please <a href="https://app.interline.io/products/tlv2_api/orders/new">sign up for a Transitland subscription</a>.
                    </o-notification>
                  </template>
                </tl-login-gate>
              </client-only>
            </o-tab-item>
          </o-tabs>
        </div>
        <div class="column is-one-third">
          <client-only placeholder="Map">
            <tl-login-gate role="tl_user">
              <tl-feed-version-map-viewer
                :route-ids="entityIds"
                :overlay="false"
                :include-stops="true"
                :link-version="linkVersion"
                :features="activeTab === tabNames.export ? features : []"
              />
              <template #loginText>
                <o-notification icon="lock">
                  To view an interactive map of this route and its stop locations, sign into a Transitland account.
                </o-notification>
              </template>
              <template #roleText>
                <o-notification icon="lock">
                  Your account does not have permission to view route map.
                </o-notification>
              </template>
            </tl-login-gate>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { useEntityPath } from '../../composables/useEntityPath'
import { shortenName, makeRouteLink, routeTypeToWords } from '../../lib/filters'

// Types
interface RouteResponse {
  id: number
  onestop_id: string
  feed_onestop_id: string
  feed_version_sha1: string
  route_id: string
  route_color?: string
  route_desc?: string
  entity_desc?: string
  route_long_name?: string
  route_short_name?: string
  route_type: number
  route_url?: string
  geometry: {
    type: string
    coordinates: any
  }
  alerts?: {
    cause: string
    effect: string
    severity_level: string
    description_text: {
      language: string
      text: string
    }[]
    header_text: {
      language: string
      text: string
    }[]
    url: {
      language: string
      text: string
    }[]
  }[]
  route_stops?: {
    stop: {
      id: number
      stop_id: string
      stop_name: string
      geometry: {
        type: string
        coordinates: any
      }
    }
  }[]
  agency: {
    id: number
    agency_id: string
    agency_name: string
    onestop_id?: string
  }
  headways?: {
    dow_category: number
    service_date: string
    direction_id: number
    headway_secs: number
    departures: number
  }[]
  feed_version: {
    id: number
    fetched_at: string
  }
}

// Extract individual types from the response type
type Route = RouteResponse
type Alert = NonNullable<RouteResponse['alerts']>[0]
type Translation = Alert['description_text'][0]
type RouteStop = NonNullable<RouteResponse['route_stops']>[0]

interface TabNames {
  summary: string
  headways: string
  sources: string
  export: string
}

// Props
const props = withDefaults(defineProps<{
  pathKey: string
  includeStops?: boolean
  feedVersionSha1?: string
  feedOnestopId?: string
  entityId?: string
}>(), {
  includeStops: true,
  feedVersionSha1: undefined,
  feedOnestopId: undefined,
  entityId: undefined
})

// Emits
const emit = defineEmits<{
  entitiesLoaded: [entities: Route[]]
  staticDescriptionUpdated: [description: string]
  routeNameUpdated: [name: string]
}>()

const q = gql`
query ($onestopId: String, $ids: [Int!], $entityId: String, $feedOnestopId: String, $feedVersionSha1: String, $include_stops: Boolean! = true, $limit: Int=10, $allowPreviousOnestopIds: Boolean = false) {
  entities: routes(limit:$limit, ids: $ids, where: {onestop_id: $onestopId, feed_onestop_id: $feedOnestopId, feed_version_sha1: $feedVersionSha1, route_id: $entityId, allow_previous_onestop_ids: $allowPreviousOnestopIds}) {
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
    route_stops(limit: 1000) @include(if: $include_stops) {
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

// Helper functions
function makeTabNames (vals: string[]): TabNames {
  const a = {} as TabNames
  for (const k of vals) {
    (a as any)[k] = k
  }
  return a
}

function filterRTTranslations (v: Translation[]): Translation[] {
  return v.filter(s => !(s?.language || '').includes('html'))
}

// Entity path setup
const { searchKey, entityVariables, linkVersion } = useEntityPath({
  pathKey: props.pathKey,
  feedVersionSha1: props.feedVersionSha1,
  feedOnestopId: props.feedOnestopId,
  entityId: props.entityId
})

// Reactive state
const features = ref<any[]>([])
const activeTab = ref('summary')
const tabNames = makeTabNames(['summary', 'headways', 'sources', 'export'])

// GraphQL query with dynamic variables
const queryVariables = computed(() => ({
  ...entityVariables.value,
  include_stops: props.includeStops,
  limit: 10
}))

const { result, loading, error } = useQuery<{ entities: RouteResponse[] }>(q, queryVariables, {
  clientId: 'transitland'
})
// Computed entities
const entities = computed((): Route[] => {
  return result.value?.entities ?? []
})

const entity = computed((): Route | null => {
  return entities.value.length > 0 ? entities.value[0] : null
})

const entityIds = computed((): number[] => {
  return entities.value.map(s => s.id)
})

// routeFeatures and stopFeatures are calculated from the main
// graphql response so we don't need to copy in and rely on the response from the map
const routeFeatures = computed(() => {
  const ret: any[] = []
  for (const f of entities.value || []) {
    const fcopy = Object.assign({}, f) as any
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
})

const stopFeatures = computed(() => {
  const ret: any[] = []
  for (const f of entities.value || []) {
    for (const g of f.route_stops || []) {
      const fcopy = Object.assign({}, g.stop) as any
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
})

const routeName = computed((): string => {
  if (entity.value) {
    const shortName = entity.value.route_short_name || ''
    const longName = entity.value.route_long_name || ''
    const nameParts = [shortName, longName].filter(Boolean).join(' ')
    return `${entity.value.agency.agency_name} - ${nameParts}`
  }
  return 'route'
})

const routeNames = computed((): Route[] => {
  const rs = new Map<string, Route>()
  for (const ent of entities.value) {
    const shortName = ent.route_short_name || ''
    const longName = ent.route_long_name || ''
    const key = `${ent.agency.agency_name}-${shortName}-${longName}-${ent.route_type}`
    rs.set(key, ent)
  }
  return Array.from(rs.values()).slice(0, 4)
})

const routeType = computed((): string => {
  return entity.value ? routeTypeToWords(entity.value.route_type) : ''
})

const staticImage = computed((): string => {
  // Note: We'll need to get the config from somewhere - for now using a placeholder
  const apiBase = 'https://transit.land/api/v2'
  return `${apiBase}/rest/routes/${props.pathKey}.png`
})

const staticTitle = computed((): string => {
  return `${routeName.value} • ${routeType.value} route`
})

const staticDescription = computed((): string => {
  return `${routeName.value} is a ${routeType.value} route available for browsing and analysis.`
})
// Methods
function setTab (value: string) {
  activeTab.value = value
}

// Watch for changes and emit events
watch(entities, (newEntities) => {
  if (newEntities) {
    emit('entitiesLoaded', newEntities)
  }
}, { immediate: true })

watch(staticDescription, (newDescription) => {
  if (newDescription) {
    emit('staticDescriptionUpdated', newDescription)
  }
}, { immediate: true })

watch(routeName, (newName) => {
  if (newName) {
    emit('routeNameUpdated', newName)
  }
}, { immediate: true })
</script>
