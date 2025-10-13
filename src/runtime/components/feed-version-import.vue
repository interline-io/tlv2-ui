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

<script>
import { gql } from 'graphql-tag'

const importFeedVersionQuery = gql`
mutation ($id:Int!) {
  feed_version_import(id: $id) {
    success
  }
}
`

const unimportFeedVersionQuery = gql`
mutation($id:Int!) {
  feed_version_unimport(id:$id) {
    success
  }
}
`

const deleteFeedVersionQuery = gql`
mutation($id:Int!) {
  feed_version_delete(id:$id) {
    success
  }
}
`

export default {
  props: {
    entity: { type: Object, default () { return null }, required: true }
  },
  emits: ['update'],
  data () {
    return {
      error: null,
      mutationLoading: false
    }
  },
  computed: {
    imported () {
      return this.fvi && this.fvi.success
    },
    fvi () {
      return (this.entity && this.entity.feed_version_gtfs_import) ? this.entity.feed_version_gtfs_import : null
    }
  },
  methods: {
    importFeedVersion () {
      this.mutationLoading = true
      this.$apollo
        .mutate({
          client: 'feedManagement',
          mutation: importFeedVersionQuery,
          variables: {
            id: this.entity.id
          },
          update: () => {
            this.mutationLoading = false
            this.$emit('update')
          }
        }).catch((error) => {
          this.error = error
        })
    },
    unimportFeedVersion () {
      this.mutationLoading = true
      this.$apollo
        .mutate({
          client: 'feedManagement',
          mutation: unimportFeedVersionQuery,
          variables: {
            id: this.entity.id
          },
          update: () => {
            this.mutationLoading = false
            this.$emit('update')
          }
        }).catch((error) => {
          this.error = error
        })
    }
  }
}
</script>
