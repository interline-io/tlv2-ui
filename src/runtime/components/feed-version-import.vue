<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>

    <tl-msg-info v-else-if="!fvi">
      This feed version is not currently imported into the database.
      <o-button :disabled="mutationLoading" class="is-pulled-right is-primary" @click="importFeedVersion">
        {{ mutationLoading ? 'Importing...' : 'Import' }}
      </o-button>
    </tl-msg-info>

    <tl-msg-info v-else-if="fvi.in_progress" icon="clock">
      Import in progress! Please be patient.
    </tl-msg-info>

    <tl-msg-success v-else-if="fvi.schedule_removed">
      Agencies, stops, and routes are available for this feed version. Schedule data is not available.
      <o-button :disabled="mutationLoading" class="is-pulled-right is-primary" @click="unimportFeedVersion">
        {{ mutationLoading ? 'Unimporting...' : 'Unimport' }}
      </o-button>
    </tl-msg-success>

    <tl-msg-success v-else-if="fvi.success" icon="check-all">
      This feed version was successfully imported into the database.
      <o-button :disabled="mutationLoading" class="is-pulled-right is-primary" @click="unimportFeedVersion">
        {{ mutationLoading ? 'Unimporting...' : 'Unimport' }}
      </o-button>
    </tl-msg-success>

    <tl-msg-warning v-else-if="!fvi.success">
      Import Error: {{ fvi.exception_log }}
    </tl-msg-warning>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'

// TypeScript interfaces
interface FeedVersionGtfsImport {
  id: number
  success: boolean
  in_progress: boolean
  schedule_removed: boolean
  exception_log: string | null
}

interface FeedVersionEntity {
  id: number
  feed_version_gtfs_import?: FeedVersionGtfsImport | null
}

interface MutationResponse {
  success: boolean
}

// Props
const props = withDefaults(defineProps<{
  entity?: FeedVersionEntity
}>(), {
  entity: () => ({} as FeedVersionEntity)
})

// Emits
const emit = defineEmits<{
  update: []
}>()

// GraphQL mutations
const importFeedVersionQuery = gql`
  mutation ($id: Int!) {
    feed_version_import(id: $id) {
      success
    }
  }
`

const unimportFeedVersionQuery = gql`
  mutation ($id: Int!) {
    feed_version_unimport(id: $id) {
      success
    }
  }
`

const _deleteFeedVersionQuery = gql`
  mutation ($id: Int!) {
    feed_version_delete(id: $id) {
      success
    }
  }
`

// Reactive state
const error = ref<string | null>(null)
const mutationLoading = ref(false)

// Computed properties
const _imported = computed(() => {
  return fvi.value && fvi.value.success
})

const fvi = computed((): FeedVersionGtfsImport | null => {
  return (props.entity && props.entity.feed_version_gtfs_import)
    ? props.entity.feed_version_gtfs_import
    : null
})

// Apollo mutations
const { mutate: importMutate } = useMutation<{ feed_version_import: MutationResponse }>(importFeedVersionQuery, {
  clientId: 'transitland'
})

const { mutate: unimportMutate } = useMutation<{ feed_version_unimport: MutationResponse }>(unimportFeedVersionQuery, {
  clientId: 'transitland'
})

// Methods
const importFeedVersion = async () => {
  if (!props.entity?.id) return

  mutationLoading.value = true
  error.value = null

  try {
    await importMutate({
      id: props.entity.id
    })
    mutationLoading.value = false
    emit('update')
  } catch (err) {
    mutationLoading.value = false
    error.value = err instanceof Error ? err.message : 'An error occurred'
  }
}

const unimportFeedVersion = async () => {
  if (!props.entity?.id) return

  mutationLoading.value = true
  error.value = null

  try {
    await unimportMutate({
      id: props.entity.id
    })
    mutationLoading.value = false
    emit('update')
  } catch (err) {
    mutationLoading.value = false
    error.value = err instanceof Error ? err.message : 'An error occurred'
  }
}
</script>
