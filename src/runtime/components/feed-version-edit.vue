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

<script>
import { gql } from 'graphql-tag'

const saveFeedVersionMutation = gql`
  mutation($set:FeedVersionSetInput!) {
    feed_version_update(set:$set) {
      id
      name
      description
    }
  }
  `

const feedVersionQuery = gql`
query($ids:[Int!]!) {
  feed_versions(ids:$ids) {
    id
    name
    description
    sha1
  }
}
`

export default {
  props: {
    id: { type: [String, Number], required: true }
  },
  apollo: {
    fvs: {
      client: 'feedManagement',
      query: feedVersionQuery,
      variables () {
        return { ids: [this.id] }
      },
      update (data) {
        if (data.feed_versions.length > 0) {
          this.entity = data.feed_versions[0]
        }
      },
      error (e) {
        this.error = e
      },
      fetchPolicy: 'no-cache'
    }
  },
  emits: ['update'],
  data () {
    return {
      entity: { id: 0, name: '', description: '' },
      error: null,
      mutationLoading: false
    }
  },
  computed: {
    validationMessage () {
      if (!this.entity.name || this.entity.name.length === 0) {
        return 'Name required'
      }
      if (!this.entity.description || this.entity.description.length === 0) {
        return 'Description required'
      }
      return null
    },
    valid () {
      return this.entity.name && this.entity.name.length > 0 && this.entity.description && this.entity.description.length > 0
    }
  },
  methods: {
    save () {
      this.mutationLoading = true
      this.$apollo
        .mutate({
          client: 'feedManagement',
          mutation: saveFeedVersionMutation,
          variables: {
            set: {
              id: this.id,
              name: this.entity.name,
              description: this.entity.description
            }
          },
          update: (_, { data }) => {
            this.mutationLoading = false
            this.$emit('update', { feed_version: data.feed_version })
          }
        }).catch((error) => {
          this.mutationLoading = false
          this.error = error
        })
    }
  }
}
</script>
