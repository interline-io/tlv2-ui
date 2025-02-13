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

      <!-- <o-field
        v-if="feed.actions.can_create_feed_version"
        label="Upload"
        horizontal
      >
        <nuxt-link
          :to="{ name: 'feeds-feedKey-upload', params: { feedKey: feed.feed?.onestop_id } }"
          class="button is-small is-primary"
        >
          Upload Feed Version
        </nuxt-link>
      </o-field> -->

      <o-field
        label="Group"
        horizontal
      >
        <tl-admin-input
          :value="feed?.group?.name || 'Unnamed Group'"
          :link="true"
        >
          <template #link>
            <nuxt-link
              v-if="feed?.group"
              class="button is-small mr-2"
              :to="{ name: 'admin-groups-groupKey', params: { groupKey: feed.group.id }}"
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
          </template>
        </tl-admin-input>
      </o-field>

      <o-field label="Your permissions" horizontal :title="`You are logged in as ${user.name} (${user.email})`">
        <tl-admin-perm-list :actions="feed?.actions" />
      </o-field>

      <tl-modal
        v-model="showAssignGroup"
        text="Show group"
        :title="`Set group`"
      >
        <tl-admin-entrel-search
          :show-users="false"
          :show-groups="true"
          @select="showAssignGroup = false; setGroup($event)"
        />
      </tl-modal>
    </div>
  </div>
</template>

<script>
import { useUser } from '../../plugins/auth'
import Loadable from '../loadable'

export default {
  mixins: [Loadable],
  props: {
    id: { type: [String, Number], required: true }
  },
  emits: ['changed'],
  data () {
    return {
      feed: null,
      showAssignGroup: false,
      user: useUser()
    }
  },
  mounted () { this.getData() },
  methods: {
    async getData () {
      return await this.fetchAdmin(`/feeds/${this.id}`).then((data) => {
        this.feed = data
      })
    },
    async setGroup (value) {
      const data = { group_id: value.id }
      await this.fetchAdmin(`/feeds/${this.id}/group`, data, 'POST')
      this.getData()
    },
    changed () {
      this.getData()
      this.$emit('changed')
    }
  }
}
</script>
