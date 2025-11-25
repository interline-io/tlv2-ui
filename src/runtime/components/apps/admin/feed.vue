<template>
  <div>
    <tl-loading v-model:active="loading" :full-page="false" />
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
        <tl-link
          route-key="feeds-feedKey-upload"
          :to="{ params: { feedKey: feed.feed?.onestop_id } }"
          class="button is-small is-primary"
        >
          Upload Feed Version
        </tl-link>
      </o-field> -->

      <o-field
        label="Group"
        horizontal
      >
        <tl-apps-admin-input
          :value="feed?.group?.name || 'Unnamed Group'"
          :link="true"
        >
          <template #link>
            <tl-link
              v-if="feed?.group"
              class="button is-small mr-2"
              route-key="apps-admin-groups-groupKey"
              :to="{ params: { groupKey: feed.group.id } }"
            >
              Show group
            </tl-link>
            <o-button
              v-if="feed.actions.can_set_group"
              size="small"
              @click="showAssignGroup = true"
            >
              Set group
            </o-button>
          </template>
        </tl-apps-admin-input>
      </o-field>

      <o-field label="Your permissions" horizontal :title="`You are logged in as ${user.name} (${user.email})`">
        <tl-apps-admin-perm-list :actions="feed?.actions" />
      </o-field>

      <tl-modal
        v-model="showAssignGroup"
        text="Show group"
        :title="`Set group`"
      >
        <tl-apps-admin-entrel-search
          :show-users="false"
          :show-groups="true"
          @select="showAssignGroup = false; setGroup($event)"
        />
      </tl-modal>
    </div>
  </div>
</template>

<script>
import { useUser } from '../../../composables/useUser'
import Loadable from './loadable'

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
