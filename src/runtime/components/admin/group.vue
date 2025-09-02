<template>
  <div>
    <o-loading v-model:active="loading" :full-page="false" />
    <o-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </o-notification>
    <div v-else-if="group">
      <div>
        <o-field
          label="Group name"
          horizontal
        >
          <tl-admin-input
            :value="group.group?.name"
            :can-edit="editable && group.actions.can_edit"
            @save="saveName"
          />
        </o-field>

        <o-field
          v-if="showTenant"
          label="Parent"
          horizontal
        >
          <tl-admin-input
            :value="group.tenant?.name"
            :link="true"
          >
            <template #link>
              <nuxt-link
                v-if="group.tenant"
                class="button is-small"
                :to="{ name: 'admin-tenants-tenantKey', params: { tenantKey: group.tenant.id }}"
              >
                View tenant
              </nuxt-link>
              <o-button
                v-if="editable && group.actions.can_set_tenant"
                size="small"
                @click="showAssignTenant = true"
              >
                Set tenant
              </o-button>
            </template>
          </tl-admin-input>
        </o-field>

        <o-field
          v-if="showFeeds"
          label="Feeds"
          horizontal
        >
          <div class="field">
            <div class="field is-grouped is-grouped-multiline">
              <tl-admin-feed-item
                v-for="v of group.feeds || []"
                :key="v.id"
                :value="v"
              />
            </div>
          </div>
        </o-field>

        <o-field v-if="showActions" label="Your permissions" horizontal :title="`You are logged in as ${user.name} (${user.email})`">
          <tl-admin-perm-list :actions="group.actions" />
        </o-field>

        <div v-if="showMembers">
          <tl-admin-entrel-list
            v-if="(editable && group.actions.can_edit_members) || group.users.managers?.length > 0"
            text="Managers"
            action-text="Add a group manager"
            :action-info="permLevels('manager')"
            :entrels="group.users.managers"
            :can-add="editable && group.actions.can_edit_members"
            :can-remove="editable && group.actions.can_edit_members"
            @add-permissions="addPermissions('manager', $event)"
            @remove-permissions="removePermissions('manager', $event)"
          />

          <tl-admin-entrel-list
            v-if="(editable && group.actions.can_edit_members) || group.users.editors?.length > 0"
            text="Editors"
            action-text="Add a group editor"
            :action-info="permLevels('editor')"
            :entrels="group.users.editors"
            :can-add="editable && group.actions.can_edit_members"
            :can-remove="editable && group.actions.can_edit_members"
            @add-permissions="addPermissions('editor', $event)"
            @remove-permissions="removePermissions('editor', $event)"
          />

          <tl-admin-entrel-list
            v-if="(editable && group.actions.can_edit_members) || group.users.viewers?.length > 0"
            text="Viewers"
            action-text="Add a group viewer"
            :action-info="permLevels('viewer')"
            :entrels="group.users.viewers"
            :can-add="editable && group.actions.can_edit_members"
            :can-remove="editable && group.actions.can_edit_members"
            :show-tenants="true"
            @add-permissions="addPermissions('viewer', $event)"
            @remove-permissions="removePermissions('viewer', $event)"
          />

          <o-field label="" horizontal>
            * Admin users in parent {{ group.tenant?.name }} are also group managers (not shown)
          </o-field>
        </div>

        <tl-modal
          v-model="showAssignTenant"
          title="Set tenant"
        >
          <tl-admin-entrel-search
            :show-users="false"
            :show-tenants="true"
            @select="showAssignTenant = false; setTenant($event)"
          />
        </tl-modal>
      </div>
    </div>
  </div>
</template>

<script>
import { useUser } from '../../composables/useUser'
import Loadable from '../loadable'
import AuthzMixin from './authz-mixin'

export default {
  mixins: [AuthzMixin, Loadable],
  props: {
    id: { type: [String, Number], required: true },
    showFeeds: { type: Boolean, default: true },
    showActions: { type: Boolean, default: true },
    showTenant: { type: Boolean, default: true },
    showMembers: { type: Boolean, default: true },
    editable: { type: Boolean, default: true }
  },
  emits: ['changed'],
  data () {
    return {
      showAssignTenant: false,
      group: null,
      pending: false,
      user: useUser()
    }
  },
  mounted () { this.getData() },
  methods: {
    permLevels (lvl) {
      return {
        can_edit: ['manager', 'editor'].includes(lvl),
        can_view: ['manager', 'editor', 'viewer'].includes(lvl),
        can_edit_members: ['manager'].includes(lvl),
        can_create_feed: ['manager', 'editor'].includes(lvl),
        can_delete_feed: ['manager', 'editor'].includes(lvl),
        can_set_tenant: false
      }
    },
    async getData () {
      return await this.fetchAdmin(`/groups/${this.id}`).then((data) => {
        this.group = data
      })
    },
    async saveName (value) {
      console.log('saveName', value)
      await this.fetchAdmin(`/groups/${this.id}`, { name: value }, 'POST')
      this.changed()
    },
    async addPermissions (relation, value) {
      console.log('addPermissions:', relation, value)
      const data = {
        id: String(value.id),
        type: this.ObjectTypes(value.type),
        ref_relation: this.Relations(value.refrel),
        relation: this.Relations(relation)
      }
      await this.fetchAdmin(`/groups/${this.id}/permissions`, data, 'POST')
      this.getData()
    },
    async removePermissions (relation, value) {
      console.log('removePermissions:', relation, value)
      const data = {
        id: String(value.id),
        type: this.ObjectTypes(value.type),
        ref_relation: this.Relations(value.refrel),
        relation: this.Relations(relation)
      }
      await this.fetchAdmin(`/groups/${this.id}/permissions`, data, 'DELETE')
      this.getData()
    },
    async setTenant (value) {
      console.log('setTenant', value)
      const data = { tenant_id: value.id }
      await this.fetchAdmin(`/groups/${this.id}/tenant`, data, 'POST')
      this.getData()
    },
    changed () {
      this.getData()
      this.$emit('changed')
    }
  }
}
</script>
