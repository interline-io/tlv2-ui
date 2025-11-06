<template>
  <div>
    <div v-if="loading">
      Loading...
    </div>
    <div v-else-if="geographies.length === 0">
      <o-notification type="light" has-icon icon="information" :closable="false">
        Demographic information not found for this route or is unavailable for this region. Currently, only information from the <a href="https://www.census.gov/programs-surveys/acs/news/data-releases/2022.html" target="_blank">US Census Bureau American Community Survey</a> is available.
      </o-notification>
    </div>
    <div v-else>
      <h5 class="title is-5">
        Census results for {{ currentLayerInfo.plural.toLowerCase() }} within {{ radius }}m of a stop.
      </h5>

      <table class="table">
        <thead>
          <tr>
            <th>Population</th>
            <th>
              <o-tooltip :label="`Population (B01001) of ${currentLayerInfo.plural.toLowerCase()} within ${radius}m of stops`">
                Total
              </o-tooltip>
            </th>
            <th>
              <o-tooltip label="Population adjusted by intersection area / total geometry area, assuming uniform density">
                Within buffer
              </o-tooltip>
            </th>
          </tr>
        </thead>
        <thead>
          <tr>
            <td>
              {{ thousands(Object.keys(tableGroups['b01001'] || {}).length) }} {{ currentLayerInfo.plural.toLowerCase() }}
            </td>
            <td>
              {{ thousands(dig(tableSums, 'b01001', 'b01001_001')) }} total
            </td>
            <td>
              {{ thousands(Math.round(dig(bufferAdjustedSums, 'b01001', 'b01001_001'))) }} total
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g of Object.values(tableGroups['b01001'] || {})" :key="g.name">
            <td>{{ g.name }}</td>
            <td>{{ thousands(dig(g.values, 'b01001_001')) }}</td>
            <td>{{ thousands(getBufferAdjustedValue(g.values, 'b01001_001', g.geography)) }}</td>
          </tr>
        </tbody>
      </table>

      <o-notification type="light" :closable="false">
        <a href="https://www.census.gov/programs-surveys/acs/news/data-releases/2022.html" target="_blank">US Census Bureau American Community Survey, 2022, 5 year</a>. This feature is in beta release; please verify values before using. You can provide feedback or suggestions for additional data tables using the contact information at the bottom of the page.
      </o-notification>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { thousands } from '../lib/filters'
import type { Geometry, Feature } from 'geojson'

// Types
interface RouteResponse {
  id: number
  route_short_name?: string
  census_geographies: {
    id: string
    geometry: Geometry
    geoid: string
    name: string
    values: {
      values: Record<string, number>
      table: {
        id: string
        table_name: string
      }
    }[]
    intersection_area?: number
    geometry_area?: number
  }[]
}

// Extract individual types from the response type
type Geography = RouteResponse['census_geographies'][0]

interface QueryVariables {
  route_ids?: number[]
  layer_name: string
  radius: number
  table_names: string[]
  table_dataset: string
  geography_dataset: string
  arg_agency_ids?: string
  arg_stop_ids?: string
}

interface LayerInfo {
  name: string
  plural: string
}

interface TableGroup {
  name: string
  values: Record<string, number>
  geography: Geography
}

type CensusFeature = Feature<Geometry, Omit<Geography, 'geometry'>>

// GraphQL Query
const CENSUS_QUERY = gql`
  query($route_ids: [Int!], $layer_name: String!, $radius: Float!, $table_names: [String!]!, $table_dataset:String, $geography_dataset: String) {
    routes(ids: $route_ids) {
      id
      route_short_name
      census_geographies(limit:10000, where:{radius: $radius, layer: $layer_name, dataset: $geography_dataset}) {
        id
        geometry: intersection_geometry
        intersection_area
        geometry_area
        geoid
        name
        values(dataset: $table_dataset, table_names: $table_names) {
          values
          table {
            id
            table_name
          }
        }      
      }
    }
  }
`

// Props
const props = withDefaults(defineProps<{
  tableDataset?: string
  geographyDataset?: string
  layer?: string
  radius?: number
  stopIds?: number[] | null
  routeIds?: number[] | null
  agencyIds?: number[] | null
}>(), {
  tableDataset: 'acsdt5y2022',
  geographyDataset: 'tiger2024',
  layer: 'tract',
  radius: 400,
  stopIds: null,
  routeIds: null,
  agencyIds: null
})

// Emits
const emit = defineEmits<{
  setFeatures: [features: CensusFeature[]]
}>()

// Utility functions
const dig = (object: any, ...path: string[]): any =>
  path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, object)

const getBufferAdjustedValue = (values: Record<string, number>, fieldKey: string, geography: Geography): number => {
  const rawValue = dig(values, fieldKey) || 0
  const adjustmentFactor = (geography.intersection_area && geography.geometry_area)
    ? geography.intersection_area / geography.geometry_area
    : 1
  return Math.round(rawValue * adjustmentFactor)
}

// Reactive data
const tableNames = ref<string[]>(['b01001'])
const geographies = ref<Geography[]>([])

const layerInfo: Record<string, LayerInfo> = {
  tract: { name: 'Tract', plural: 'Tracts' },
  county: { name: 'County', plural: 'Counties' },
  // bg: { name: 'Block Group', plural: 'Block Groups' }
  state: { name: 'State', plural: 'States' },
  // city: { name: 'City (Census Designated Place)', plural: 'Cities' },
  // cd: { name: 'Congressional District', plural: 'Congressional Districts' }
}

const currentLayerInfo = computed<LayerInfo>(() => {
  const layer = props.layer || 'tract'
  return layerInfo[layer] || { name: 'Tract', plural: 'Tracts' }
})

// Computed query variables
const queryVariables = computed<QueryVariables>(() => {
  const variables: QueryVariables = {
    table_dataset: props.tableDataset || 'acsdt5y2022',
    geography_dataset: props.geographyDataset || 'tiger2024',
    table_names: tableNames.value,
    layer_name: props.layer || 'tract',
    radius: props.radius || 400
  }

  if (props.agencyIds) {
    variables.arg_agency_ids = `{${props.agencyIds.join(',')}}`
  } else if (props.routeIds) {
    variables.route_ids = props.routeIds
  } else if (props.stopIds) {
    variables.arg_stop_ids = `{${props.stopIds.join(',')}}`
  }

  return variables
})

// Apollo Query
const { result, loading } = useQuery<{ routes: RouteResponse[] }>(
  CENSUS_QUERY,
  queryVariables,
  {
    clientId: 'transitland'
  }
)

// Watch for query results and update geographies
watch(result, (newResult) => {
  if (newResult) {
    const allGeographies: Geography[] = []
    for (const route of newResult.routes || []) {
      for (const geography of route.census_geographies || []) {
        allGeographies.push(geography)
      }
    }
    geographies.value = allGeographies
  }
}, { immediate: true })

// Computed properties
const geographiesByID = computed<Record<string, Geography>>(() => {
  const geogMap: Record<string, Geography> = {}
  for (const geography of geographies.value) {
    geogMap[geography.id] = geography
  }
  return geogMap
})

const tableGroups = computed<Record<string, Record<string, TableGroup>>>(() => {
  const groups: Record<string, Record<string, TableGroup>> = {}

  for (const geography of Object.values(geographiesByID.value)) {
    for (const tableValue of geography.values) {
      const tableName = tableValue.table.table_name
      if (!groups[tableName]) {
        groups[tableName] = {}
      }
      groups[tableName][geography.id] = {
        name: geography.name,
        values: tableValue.values,
        geography: geography
      }
    }
  }

  return groups
})

const tableSums = computed<Record<string, Record<string, number>>>(() => {
  const sums: Record<string, Record<string, number>> = {}

  for (const [tableName, geogs] of Object.entries(tableGroups.value)) {
    const tableSum: Record<string, number> = {}

    for (const table of Object.values(geogs)) {
      for (const [fieldKey, fieldValue] of Object.entries(table.values)) {
        if (fieldValue >= 0) {
          tableSum[fieldKey] = tableSum[fieldKey] ? tableSum[fieldKey] + fieldValue : fieldValue
        } else {
          tableSum[fieldKey] = Number.NaN
          break
        }
      }
    }

    sums[tableName] = tableSum
  }

  return sums
})

const bufferAdjustedSums = computed<Record<string, Record<string, number>>>(() => {
  const sums: Record<string, Record<string, number>> = {}

  for (const [tableName, geogs] of Object.entries(tableGroups.value)) {
    const tableSum: Record<string, number> = {}

    for (const table of Object.values(geogs)) {
      const adjustmentFactor = (table.geography.intersection_area && table.geography.geometry_area)
        ? table.geography.intersection_area / table.geography.geometry_area
        : 1

      for (const [fieldKey, fieldValue] of Object.entries(table.values)) {
        const adjustedValue = fieldValue * adjustmentFactor
        if (adjustedValue >= 0) {
          tableSum[fieldKey] = tableSum[fieldKey] ? tableSum[fieldKey] + adjustedValue : adjustedValue
        } else {
          tableSum[fieldKey] = Number.NaN
          break
        }
      }
    }

    sums[tableName] = tableSum
  }

  return sums
})

const features = computed<CensusFeature[]>(() => {
  if (loading.value) {
    return []
  }

  const geoJsonFeatures: CensusFeature[] = []

  for (const geography of Object.values(geographiesByID.value)) {
    const { geometry, ...properties } = geography
    geoJsonFeatures.push({
      type: 'Feature',
      geometry,
      properties
    })
  }

  return geoJsonFeatures
})

// Watch features and emit changes
watch(features, (newFeatures) => {
  emit('setFeatures', newFeatures)
}, { immediate: true })
</script>

<style scoped>
.census-total {
  border-bottom:solid 2px #ccc
}
</style>
