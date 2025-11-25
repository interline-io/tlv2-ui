<template>
  <div>
    <tl-loading v-model:active="loading" :full-page="false" />
    <o-notification
      v-if="error"
      variant="danger"
    >
      {{ error }}
    </o-notification>
    <div v-else-if="tenant && filterAction && !tenant.actions[filterAction]" />
    <div v-else-if="tenant">
      <o-field
        label="Name"
        horizontal
      >
        <tl-apps-admin-input
          :value="tenant.tenant?.name"
          :can-edit="tenant.actions.can_edit"
          @save="saveName"
        />
      </o-field>

      <o-field
        label="Groups"
        horizontal
      >
        <o-button
          v-if="tenant.actions.can_create_org"
          icon-left="plus"
          size="small"
          @click="createGroup"
        >
          Create group
        </o-button>
        <div class="field">
          <div class="field is-grouped is-grouped-multiline">
            <tl-apps-admin-group-item
              v-for="group of nameSort(tenant.groups || [])"
              :key="group.id"
              :value="group"
            />
          </div>
        </div>
      </o-field>

      <o-field label="Your permissions" horizontal :title="`You are logged in as ${user.name} (${user.email})`">
        <tl-apps-admin-perm-list :actions="tenant.actions" />
      </o-field>

      <tl-apps-admin-entrel-list
        v-if="tenant.actions.can_edit_members || tenant.users.admins?.length > 0"
        text="Admins"
        action-text="Add a tenant admin"
        :action-info="permLevels('admin')"
        :entrels="tenant.users.admins"
        :can-add="tenant.actions.can_edit_members"
        :can-remove="tenant.actions.can_edit_members"
        @add-permissions="addPermissions('admin', $event)"
        @remove-permissions="removePermissions('admin', $event)"
      />

      <tl-apps-admin-entrel-list
        v-if="tenant.actions.can_edit_members || tenant.users.members?.length > 0"
        text="Members"
        action-text="Add a tenant member"
        :action-info="permLevels('member')"
        :entrels="tenant.users.members"
        :can-add="tenant.actions.can_edit_members"
        :can-remove="tenant.actions.can_edit_members"
        :show-user-star="true"
        @add-permissions="addPermissions('member', $event)"
        @remove-permissions="removePermissions('member', $event)"
      />
    </div>
  </div>
</template>

<script>
import { useUser } from '../../../composables/useUser'
import { nameSort } from '../../../lib/filters'
import Loadable from './loadable'
import AuthzMixin from './authz-mixin'

export default {
  mixins: [AuthzMixin, Loadable],
  props: {
    id: { type: [String, Number], required: true },
    filterAction: { type: String, default: null }
  },
  emits: ['changed'],
  data () {
    return {
      tenant: null,
      user: useUser()
    }
  },
  mounted () { this.getData() },
  methods: {
    nameSort,
    permLevels (lvl) {
      return {
        can_edit: ['admin'].includes(lvl),
        can_view: ['admin', 'member'].includes(lvl),
        can_edit_members: ['admin'].includes(lvl),
        can_create_org: ['admin'].includes(lvl),
        can_delete_org: ['admin'].includes(lvl)
      }
    },
    async getData () {
      return await this.fetchAdmin(`/tenants/${this.id}`).then((data) => {
        this.tenant = data
      })
    },
    async saveName (value) {
      console.log('saveName', value)
      await this.fetchAdmin(`/tenants/${this.id}`, { name: value }, 'POST')
      this.changed()
    },
    async addPermissions (relation, value) {
      console.log('addPermissions:', relation, value)
      const data = {
        id: value.id,
        type: this.ObjectTypes(value.type),
        ref_relation: this.Relations(value.refrel),
        relation: this.Relations(relation)
      }
      await this.fetchAdmin(`/tenants/${this.id}/permissions`, data, 'POST')
      this.getData()
    },
    async removePermissions (relation, value) {
      console.log('removePermissions:', relation, value)
      const data = {
        id: value.id,
        type: this.ObjectTypes(value.type),
        ref_relation: this.Relations(value.refrel),
        relation: this.Relations(relation)
      }
      await this.fetchAdmin(`/tenants/${this.id}/permissions`, data, 'DELETE')
      this.getData()
    },
    async createGroup () {
      console.log('createGroup')
      const data = { group: { name: 'New Group' } }
      await this.fetchAdmin(`/tenants/${this.id}/groups`, data, 'POST')
      this.changed()
    },
    changed () {
      this.getData()
      this.$emit('changed')
    }
  }
}
</script>
