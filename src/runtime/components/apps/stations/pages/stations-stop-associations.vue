<template>
  <div>
    <slot name="title">
      <tl-title title="Stop ID Associations" />
    </slot>

    <t-loading :active="loading" :full-page="false" />
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

<script setup lang="ts">
import { computed, toRefs, onMounted } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import type { Stop } from '../station'

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

const props = defineProps<{
  feedKey: string
  feedVersionKey: string
  clientId?: string
}>()

const { feedKey, feedVersionKey, clientId } = toRefs(props)

// Query for stops with external references
const { result, loading, fetchMore: apolloFetchMore } = useQuery(
  q,
  () => ({
    feed_onestop_id: feedKey.value,
    limit: 0,
    after: 0
  }),
  () => ({
    clientId: clientId.value,
    fetchPolicy: 'cache-and-network'
  })
)

const stops = computed(() => result.value?.stops || [])

const stopsWithRefs = computed(() => {
  const ret: Stop[] = []
  for (const stop of stops.value) {
    if (!stop.external_reference || !stop) {
      continue
    }
    ret.push(stop)
  }
  return ret.sort((a, b) => {
    const nameA = (a.parent ? a.parent.stop_name : 'zzz') + (a.stop_id || '')
    const nameB = (b.parent ? b.parent.stop_name : 'zzz') + (b.stop_id || '')
    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }
    return 0
  })
})

const fetchMore = (after: number) => {
  apolloFetchMore({
    variables: {
      feed_onestop_id: feedKey.value,
      limit: 100,
      after
    },
    updateQuery: (previousResult: any, { fetchMoreResult }: any) => {
      const newTags = fetchMoreResult.stops
      if (newTags.length === 0) {
        return previousResult
      }
      const newAfter = newTags[newTags.length - 1].id
      const result = after === 0 ? newTags : [...previousResult.stops, ...newTags]
      fetchMore(newAfter)
      return {
        stops: result
      }
    }
  })
}

onMounted(() => {
  fetchMore(0)
})
</script>
