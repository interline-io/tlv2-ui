<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else>
      <o-field label="Name" horizontal>
        <o-input v-model="entity.name" expanded type="text" required placeholder="A short name for this feed version..." />
      </o-field>
      <o-field label="Description" horizontal>
        <o-input v-model="entity.description" expanded type="text" required placeholder="A longer description of this feed version..." />
      </o-field>
      <div class="block is-clearfix">
        <o-field label="" :message="validationMessage" variant="danger" class="is-pulled-right">
          <o-button v-if="mutationLoading" variant="primary" :disabled="true">
            Saving...
          </o-button>
          <o-button v-else variant="primary" :disabled="!valid" @click="save">
            Save
          </o-button>
        </o-field>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'

// TypeScript interfaces
interface FeedVersion {
  id: number
  name: string
  description: string
  sha1?: string
}

interface FeedVersionSetInput {
  id: number | string
  name: string
  description: string
}

interface FeedVersionUpdateResponse {
  feed_version_update: FeedVersion
}

interface FeedVersionsQueryResponse {
  feed_versions: FeedVersion[]
}

// Props
interface Props {
  id: string | number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  update: [payload: { feed_version: FeedVersion }]
}>()

// GraphQL queries and mutations
const feedVersionQuery = gql`
  query($ids: [Int!]!) {
    feed_versions(ids: $ids) {
      id
      name
      description
      sha1
    }
  }
`

const saveFeedVersionMutation = gql`
  mutation($set: FeedVersionSetInput!) {
    feed_version_update(set: $set) {
      id
      name
      description
    }
  }
`

// Reactive state
const entity = ref<FeedVersion>({ id: 0, name: '', description: '' })
const error = ref<string | null>(null)
const mutationLoading = ref(false)

// Apollo query
const { result, loading, error: queryError } = useQuery<FeedVersionsQueryResponse>(
  feedVersionQuery,
  () => ({
    ids: [Number(props.id)]
  }),
  {
    clientId: 'transitland',
    fetchPolicy: 'no-cache'
  }
)

// Apollo mutation
const { mutate: updateFeedVersion } = useMutation<FeedVersionUpdateResponse>(
  saveFeedVersionMutation,
  {
    clientId: 'transitland'
  }
)

// Watch for query results
watch(result, (newResult) => {
  if (newResult?.feed_versions && newResult.feed_versions.length > 0) {
    entity.value = { ...newResult.feed_versions[0] }
  }
})

// Watch for query errors
watch(queryError, (newError) => {
  if (newError) {
    error.value = newError.message
  }
})

// Computed properties
const validationMessage = computed((): string | null => {
  if (!entity.value.name || entity.value.name.length === 0) {
    return 'Name required'
  }
  if (!entity.value.description || entity.value.description.length === 0) {
    return 'Description required'
  }
  return null
})

const valid = computed((): boolean => {
  return entity.value.name
    && entity.value.name.length > 0
    && entity.value.description
    && entity.value.description.length > 0
})

// Methods
const save = async () => {
  mutationLoading.value = true
  error.value = null
  
  try {
    const result = await updateFeedVersion({
      set: {
        id: props.id,
        name: entity.value.name,
        description: entity.value.description
      }
    })
    
    mutationLoading.value = false
    
    if (result?.data?.feed_version_update) {
      emit('update', { feed_version: result.data.feed_version_update })
    }
  } catch (err) {
    mutationLoading.value = false
    error.value = err instanceof Error ? err.message : 'An error occurred'
  }
}
</script>
