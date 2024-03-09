<template>
  <div>
    <o-loading v-model:active="loading" :full-page="false" />
    <o-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </o-notification>
    <div v-if="feed">
      <o-field label="Feed name" horizontal>
        {{ feed.feed.name }}
      </o-field>

      <o-field label="Feed ID" horizontal>
        {{ feed.feed.onestop_id }}
      </o-field>

      <o-field
        v-if="feed.actions.can_create_feed_version"
        label="Upload"
        horizontal
      >
        <nuxt-link
          :to="{ name: 'analyst-feeds-feed-upload', params: { feed: feed.feed?.onestop_id } }"
          class="button is-small is-primary"
        >
          Upload Feed Version
        </nuxt-link>
      </o-field>

      <o-field
        label="Group"
        horizontal
      >
        <template v-if="feed?.group">
          <tl-admin-ghost-button :text="feed?.group?.name || 'Unnamed Group'" />
          <o-field>
            <nuxt-link
              class="button is-small mr-2"
              :to="{ name: 'admin-groups-group', params: { group: feed.group.id }}"
            >
              Show group
            </nuxt-link>
            <o-button
              v-if="feed.actions.can_set_group"
              size="small"
              @click="showAssignGroup = true"
            >
              Set group
            </o-button>
          </o-field>
        </template>
        <template v-else>
          <o-button
            v-if="feed.actions.can_set_group"
            size="small"
            @click="showAssignGroup = true"
          >
            Set group
          </o-button>
        </template>
      </o-field>

      <o-field label="Your permissions" horizontal :title="`You are logged in as ${user.name} (${user.email})`">
        <tl-admin-perm-list :actions="feed?.actions" />
      </o-field>

      <tl-admin-modal
        v-model="showAssignGroup"
        text="Show group"
        :title="`Set group`"
      >
        <tl-admin-entrel-search
          :show-users="false"
          :show-groups="true"
          @select="showAssignGroup = false; setGroup($event)"
        />
      </tl-admin-modal>
    </div>
  </div>
</template>

<script>
import AuthzMixin from './authz-mixin'

export default {
  mixins: [AuthzMixin],
  props: {
    id: { type: [String, Number], required: true }
  },
  emits: ['changed'],
  data () {
    return {
      feed: null,
      error: null,
      showAssignGroup: false
    }
  },
  mounted () { this.getData() },
  methods: {
    async getData () {
      this.loading = true
      await fetch(
        `${this.apiBase()}/admin/feeds/${this.id}`, {
          headers: { authorization: await this.getAuthToken() }
        })
        .then(this.handleError)
        .then((data) => {
          this.feed = data
        })
        .catch((e) => {
          this.error = e
        })
      this.loading = false
    },
    async setGroup (value) {
      this.loading = true
      await fetch(
        `${this.apiBase()}/admin/feeds/${this.id}/group`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', authorization: await this.getAuthToken() },
          body: JSON.stringify({ group_id: value.id })
        }
      )
      this.getData()
    },
    changed () {
      this.getData()
      this.$emit('changed')
    }
  }
}
</script>
