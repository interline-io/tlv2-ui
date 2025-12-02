<template>
  <div>
    <slot name="title">
      <tl-title title="Stop ID Associations" />
    </slot>

    <t-loading :active="$apollo.loading" :full-page="false" />
    <t-table
      :data="stopsWithRefs"
      narrowed
      striped
      hoverable
      :default-sort="['target_stops', 'asc']"
    >
      <template #columns>
        <t-table-column field="stop.parent.stop_name" label="Station" sortable />
        <t-table-column field="target_feed_onestop_id" label="Target feed Onestop ID" sortable />
        <t-table-column field="target_stop_id" label="Target stop ID" sortable />
        <t-table-column field="target_stops" label="Stop ID association found?" sortable />
        <t-table-column field="location_type" label="Target location type" sortable />
        <t-table-column label="Routes serving stop" />
        <t-table-column label="Actions" />
      </template>

      <template #default="{ row }">
        <td>
          <tl-link
            v-if="row.parent"
            route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey"
            :to="{ params: { feedKey, feedVersionKey, stationKey: row.parent.stop_id } }"
          >
            {{ row.parent.stop_name }}
          </tl-link>
        </td>
        <td>
          <code>{{ row.external_reference.target_feed_onestop_id }}</code>
        </td>
        <td>
          <code>{{ row.external_reference.target_stop_id }}</code>
        </td>
        <td>
          <span v-if="row.external_reference.target_active_stop">
            <span class="icon"><i class="mdi mdi-check mdi-24px" /></span>
          </span><span v-else>
            <span class="icon has-text-warning"><i class="mdi mdi-alert mdi-24px" /></span>
          </span>
        </td>
        <td>
          <span v-if="row.external_reference?.target_active_stop">
            <span class="icon">{{ row.external_reference?.target_active_stop?.location_type }}</span>
          </span><span v-else>
            <span class="icon has-text-warning"><i class="mdi mdi-alert mdi-24px" /></span>
          </span>
        </td>
        <td>
          <span v-if="row.external_reference.target_active_stop && row.external_reference.target_active_stop.route_stops">
            <ul>
              <li v-for="rs of row.external_reference.target_active_stop.route_stops" :key="rs.route.id">
                {{ rs.route.agency.agency_name }}: {{ rs.route.route_short_name || rs.route.route_long_name }}
              </li>
            </ul>
          </span>
        </td>
        <td>
          <tl-link
            v-if="row.parent"
            route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways"
            :to="{ params: { feedKey, feedVersionKey, stationKey: row.parent.stop_id }, query: { selectedStop: row.id } }"
          >
            Re-assign stop
          </tl-link>
        </td>
      </template>
    </t-table>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'
import FeedMixin from './feed-mixin'

const q = gql`
  query ($feed_onestop_id: String!, $after: Int!) {
    stops(limit: 1000, after:$after, where:{feed_onestop_id:$feed_onestop_id}) {
      id
      stop_id
      stop_name
      geometry
      location_type
      parent {
        id
        stop_id
        stop_name
      }
      external_reference {
        id
        target_stop_id
        target_feed_onestop_id
        target_active_stop {
          id
          stop_id
          stop_name
          geometry
          location_type
          route_stops {
            route {
              id
              route_short_name
              route_long_name
              agency {
                id
                agency_id
                agency_name
              }
            }
          }
        }
      }
    }
  }
  `

export default {
  mixins: [FeedMixin],
  props: {
    client: { type: String, default: 'default' }
  },
  setup () {
    const { resolve } = useRouteResolver()
    return { resolve }
  },
  data () {
    return {
      stops: []
    }
  },
  apollo: {
    stops: {
      client: 'stationEditor',
      query: q,
      variables () {
        return {
          feed_onestop_id: this.feedKey,
          limit: 0,
          after: 0
        }
      }
    }
  },
  computed: {
    lastStopId () {
      return this.stops.length > 0 ? this.stops[this.stops.length - 1].id : 0
    },
    stopsWithRefs () {
      const ret = []
      for (const stop of this.stops) {
        if (!stop.external_reference || !stop) {
          continue
        }
        ret.push(stop)
      }
      return ret.sort((a, b) => {
        const nameA = (a.parent ? a.parent.stop_name : 'zzz') + a.stop_id
        const nameB = (b.parent ? b.parent.stop_name : 'zzz') + b.stop_id
        if (nameA < nameB) {
          return -1
        }
        if (nameA > nameB) {
          return 1
        }
        return 0
      })
    }
  },
  mounted () {
    this.fetchMore(0)
  },
  methods: {
    fetchMore (after) {
      // console.log('fetchMore after:', after)
      this.$apollo.queries.stops.fetchMore({
        variables: {
          feed_onestop_id: this.feedKey,
          limit: 100,
          // feed_version_file: this.feedVersionKey,
          after
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const newTags = fetchMoreResult.stops
          if (newTags.length === 0) {
            return
          }
          const newAfter = newTags[newTags.length - 1].id
          let result = []
          if (after === 0) {
            result = newTags
          } else {
            result = [...previousResult.stops, ...newTags]
          }
          this.fetchMore(newAfter)
          return {
            stops: result
          }
        }
      })
    }
  }
}
</script>
