<template>
  <div>
    <div v-if="$apollo.loading">
      Loading...
    </div>
    <div v-else-if="geographies.length === 0">
      <o-notification type="light" has-icon icon="information" :closable="false">
        Demographic information not found for this route or is unavailable for this region. Currently, only information from the <a href="https://www.census.gov/programs-surveys/acs/news/data-releases/2022.html" target="_blank">US Census Bureau American Community Survey</a> is available.
      </o-notification>
    </div>
    <div v-else>
      <h5 class="title is-5">
        Census results for {{ layerInfo[layer].plural.toLowerCase() }} within {{ radius }}m of a stop.
      </h5>

      <table class="table">
        <thead>
          <tr>
            <th>
              <o-tooltip :label="`Population (B01001) of ${layerInfo[layer].plural.toLowerCase()} within ${radius}m of stops`">
                Population
              </o-tooltip>
            </th>
            <th>Value</th>
          </tr>
        </thead>
        <thead>
          <tr>
            <td>
              {{ $filters.thousands(Object.keys(tableGroups['b01001'] || {}).length) }} {{ layerInfo[layer].plural.toLowerCase() }}
            </td>
            <td>
              {{ $filters.thousands(dig(tableSums, 'b01001', 'b01001_001')) }} total
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g of tableGroups['b01001']" :key="g.id">
            <td>{{ g.name }}</td>
            <td>{{ $filters.thousands(dig(g.values, 'b01001_001')) }}</td>
          </tr>
        </tbody>
      </table>

      <o-notification type="light" :closable="false">
        <a href="https://www.census.gov/programs-surveys/acs/news/data-releases/2022.html" target="_blank">US Census Bureau American Community Survey, 2022, 5 year</a>. This feature is in beta release; please verify values before using. You can provide feedback or suggestions for additional data tables using the contact information at the bottom of the page.
      </o-notification>
    </div>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'

const dig = (object, ...path) => path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, object)

const q = gql`
query($route_ids: [Int!], $layer_name: String!, $radius: Float!, $table_names: [String!]!, $table_dataset:String, $geography_dataset: String) {
  routes(ids: $route_ids) {
    id
    route_short_name
    census_geographies(where:{radius: $radius, layer: $layer_name, dataset: $geography_dataset}) {
      id
      geometry
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

export default {
  props: {
    tableDataset: { type: String, default: 'acsdt5y2022' },
    geographyDataset: { type: String, default: 'tiger2024' },
    layer: { type: String, default: 'tract' },
    radius: { type: Number, default: 400 },
    stopIds: { type: Array, default () { return null } },
    routeIds: { type: Array, default () { return null } },
    agencyIds: { type: Array, default () { return null } }
  },
  emits: ['setFeatures'],
  data () {
    return {
      tableNames: ['b01001'],
      geographies: [],
      // copied...
      layerInfo: {
        tract: { name: 'Tract', plural: 'Tracts' },
        county: { name: 'County', plural: 'Counties' }
        // bg: { name: 'Block Group', plural: 'Block Groups' }
        // state: { name: 'State', plural: 'States' },
        // city: { name: 'City (Census Designated Place)', plural: 'Cities' },
        // cd: { name: 'Congressional District', plural: 'Congressional Districts' }
      }
    }
  },
  computed: {
    geographiesByID () {
      const a = {}
      for (const g of this.geographies) {
        a[g.id] = g
      }
      return a
    },
    tableGroups () {
      // Invert
      const tableGroups = {}
      for (const geog of Object.values(this.geographiesByID)) {
        for (const tableValue of geog.values) {
          const tableName = tableValue.table.table_name
          if (!tableGroups[tableName]) { tableGroups[tableName] = {} }
          tableGroups[tableName][geog.id] = { name: geog.name, values: tableValue.values }
        }
      }
      return tableGroups
    },
    tableSums () {
      // Calculate sums of each table and field
      const tableSums = {}
      for (const [tableName, geogs] of Object.entries(this.tableGroups)) {
        const tableSum = {}
        for (const table of Object.values(geogs)) {
          for (const [fieldKey, fieldValue] of Object.entries(table.values)) {
            if (fieldValue >= 0) {
              tableSum[fieldKey] = tableSum[fieldKey] ? tableSum[fieldKey] + fieldValue : fieldValue
            } else {
              tableSum[fieldKey] = NaN
              break
            }
          }
        }
        tableSums[tableName] = tableSum
      }
      return tableSums
    },
    features () {
      if (this.$apollo.loading) { return [] }
      const ret = []
      for (const f of Object.values(this.geographiesByID)) {
        const fcopy = Object.assign({}, f)
        delete fcopy.geometry
        ret.push({
          geometry: f.geometry,
          properties: fcopy,
          type: 'Feature'
        })
      }
      return ret
    }
  },
  watch: {
    features () {
      this.$emit('setFeatures', this.features)
    }
  },
  methods: {
    dig
  },
  apollo: {
    routes: {
      client: 'transitland',
      query: q,
      variables () {
        const q = {
          table_dataset: this.tableDataset,
          geography_dataset: this.geographyDataset,
          table_names: this.tableNames,
          layer_name: this.layer,
          radius: this.radius
        }
        if (this.agencyIds) {
          q.arg_agency_ids = `{${this.agencyIds.join(',')}}`
        } else if (this.routeIds) {
          q.route_ids = this.routeIds
        } else if (this.stopIds) {
          q.arg_stop_ids = `{${this.stopIds.join(',')}}`
        }
        return q
      },
      update (data) {
        const a = []
        for (const ent of data.routes || []) {
          for (const g of ent.census_geographies || []) {
            a.push(g)
          }
        }
        this.geographies = a
      }
    }
  }
}
</script>

<style scoped>
.census-total {
  border-bottom:solid 2px #ccc
}
</style>
