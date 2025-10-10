<template>
  <div>
    <slot name="title">
      <tl-title title="Stop ID Associations" />
    </slot>

    <o-loading v-model="$apollo.loading" :is-full-page="false" />
    <o-table
      :data="stopsWithRefs"
      narrowed
      striped
      :default-sort="['external_reference.target_active_stop', 'asc']"
    >
      <o-table-column
        v-slot="props"
        sortable
        field="parent.stop_name"
        label="Station"
      >
        <template v-if="props.row.parent">
          <nuxt-link
            :to="{name:'editor-feedKey-feedVersionKey-stations-stationKey', params: {feedKey, feedVersionKey, stationKey:props.row.parent.stop_id}}"
          >
            {{ props.row.parent.stop_name }}
          </nuxt-link>
        </template>
      </o-table-column>

      <o-table-column
        v-slot="props"
        sortable
        field="external_reference.target_feed_onestop_id"
        label="Target feed Onestop ID"
      >
        <code>{{ props.row.external_reference.target_feed_onestop_id }}</code>
      </o-table-column>
      <o-table-column
        v-slot="props"
        sortable
        field="external_reference.target_stop_id"
        label="Target stop ID"
      >
        <code>{{ props.row.external_reference.target_stop_id }}</code>
      </o-table-column>
      <o-table-column
        v-slot="props"
        field="external_reference.target_active_stop"
        label="Stop ID association found?"
        sortable
      >
        <span v-if="props.row.external_reference.target_active_stop">
          <span class="icon"><i class="mdi mdi-check mdi-24px" /></span>
        </span><span v-else>
          <span class="icon has-text-warning"><i class="mdi mdi-alert mdi-24px" /></span>
        </span>
      </o-table-column>

      <o-table-column
        v-slot="props"
        field="external_reference.target_active_stop.location_type"
        label="Target location type"
        sortable
      >
        <span v-if="props.row.external_reference?.target_active_stop">
          <span class="icon">{{ props.row.external_reference?.target_active_stop?.location_type }}</span>
        </span><span v-else>
          <span class="icon has-text-warning"><i class="mdi mdi-alert mdi-24px" /></span>
        </span>
      </o-table-column>

      <o-table-column
        v-slot="props"
        label="Routes serving stop"
      >
        <span v-if="props.row.external_reference.target_active_stop && props.row.external_reference.target_active_stop.route_stops">
          <ul>
            <li v-for="rs of props.row.external_reference.target_active_stop.route_stops" :key="rs.route.id">
              {{ rs.route.agency.agency_name }}: {{ rs.route.route_short_name || rs.route.route_long_name }}
            </li>
          </ul>
        </span>
      </o-table-column>
      <o-table-column
        v-slot="props"
        label="Actions"
      >
        <template v-if="props.row.parent">
          <nuxt-link
            :to="{name:'editor-feedKey-feedVersionKey-stations-stationKey-pathways', params: {feedKey, feedVersionKey, stationKey:props.row.parent.stop_id}, query:{ selectedStop:props.row.id}}"
          >
            Re-assign stop
          </nuxt-link>
        </template>
      </o-table-column>
    </o-table>
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
  data () {
    return {
      stops: []
    }
  },
  apollo: {
    stops: {
      client: 'transitland',
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
      return ret
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
