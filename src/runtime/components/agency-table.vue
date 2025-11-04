<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else>
      <tl-search-bar v-model="search" placeholder="Filter Agencies" />
      <o-loading v-model:active="loading" :full-page="false" />
      <div class="table-container">
        <table class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Agency ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="agency of entities" :key="agency.id">
              <td>
                {{ agency.agency_id }}
              </td>
              <td>
                {{ agency.agency_name }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <tl-show-more v-if="entities.length === limit || hasMore" :limit="entities.length" @click="showAll" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'

// Watch for query errors
import { watch } from 'vue'

// Props
const props = withDefaults(defineProps<{
  fvid?: string
  limit?: number
}>(), {
  fvid: '',
  limit: 100
})

// Reactive state
const search = ref<string>('')
const hasMore = ref(false)
const error = ref<string | null>(null)

// GraphQL query
interface AgencyResponse {
  id: number
  agency_id: string
  agency_name: string
  agency_url?: string | null
  feed_onestop_id: string
  feed_version_sha1: string
}

type Agency = AgencyResponse

const agenciesQuery = gql`
  query ($feed_version_sha1: String, $limit: Int = 100, $after: Int, $search: String) {
    entities: agencies(after: $after, limit: $limit, where: {feed_version_sha1: $feed_version_sha1, search: $search}) {
      id
      agency_id
      agency_name
      agency_url
      feed_onestop_id
      feed_version_sha1
    }
  }
`

// Apollo query
const { result, loading, error: queryError, fetchMore } = useQuery<{ entities: AgencyResponse[] }>(
  agenciesQuery,
  () => ({
    search: search.value,
    feed_version_sha1: props.fvid,
    limit: props.limit
  }),
  {
    clientId: 'transitland'
  }
)
watch(queryError, (newError) => {
  if (newError) {
    error.value = newError.message
  }
})

// Computed properties
const entities = computed<Agency[]>(() => result.value?.entities || [])

// Methods
const showAll = async () => {
  const newLimit = 1000
  const lastId = entities.value.length > 0 ? entities.value[entities.value.length - 1].id : 0

  try {
    await fetchMore({
      variables: {
        after: lastId,
        limit: newLimit
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (fetchMoreResult.entities.length >= newLimit) {
          hasMore.value = true
        } else {
          hasMore.value = false
        }
        return {
          entities: [...previousResult.entities, ...fetchMoreResult.entities]
        }
      }
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load more agencies'
  }
}
</script>
