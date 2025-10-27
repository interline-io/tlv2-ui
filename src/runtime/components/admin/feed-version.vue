<template>
  <div>
    <o-loading v-model:active="loading" :full-page="false" />
    <o-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </o-notification>
    <div v-else-if="fv && perms">
      <o-field label="Your permissions" horizontal :title="`You are logged in as ${user.name} (${user.email})`">
        <tl-admin-perm-list :actions="perms.actions" />
      </o-field>

      <tl-admin-entrel-list
        v-if="perms.actions.can_edit_members || perms.users.editors?.length > 0"
        text="Editors"
        action-text="Add a feed version editor"
        :action-info="permLevels('editor')"
        :entrels="perms.users.editors"
        :can-add="perms.actions.can_edit_members"
        :can-remove="perms.actions.can_edit_members"
        :show-groups="true"
        :show-tenants="true"
        @add-permissions="addPermissions('editor', $event)"
        @remove-permissions="removePermissions('editor', $event)"
      />

      <tl-admin-entrel-list
        v-if="perms.actions.can_edit_members || perms.users.viewers?.length > 0"
        text="Viewers"
        action-text="Add a feed version viewer"
        :action-info="permLevels('viewer')"
        :entrels="perms.users.viewers"
        :can-add="perms.actions.can_edit_members"
        :can-remove="perms.actions.can_edit_members"
        :show-groups="true"
        :show-tenants="true"
        @add-permissions="addPermissions('viewer', $event)"
        @remove-permissions="removePermissions('viewer', $event)"
      />

      <o-field label="" horizontal>
        * Permissions are additive with permissions defined by feed and group (not shown)
      </o-field>
    </div>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'
import Loadable from '../loadable'
import AuthzMixin from './authz-mixin'
import { useUser } from '../../composables/useUser'

const feedVersionQuery = gql`
query($ids:[Int!]!) {
  feed_versions(ids:$ids) {
    id
    name
    sha1
    description
  }
}
`

export default {
  mixins: [AuthzMixin, Loadable],
  props: {
    id: { type: [String, Number], required: true },
    client: { type: String, default: 'default' }
  },
  emits: ['changed'],
  apollo: {
    fvs: {
      client: () => (this.client),
      query: feedVersionQuery,
      variables () {
        return { ids: [this.id] }
      },
      update (data) {
        if (data.feed_versions.length > 0) {
          this.fv = data.feed_versions[0]
        }
      },
      error (e) {
        this.error = e
      },
      fetchPolicy: 'no-cache'
    }
  },
  data () {
    return {
      showTenant: false,
      fv: null,
      perms: null,
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
        can_edit_members: ['manager'].includes(lvl)
      }
    },
    async getData () {
      return await this.fetchAdmin(`/feed_versions/${this.id}`).then((data) => {
        this.perms = data
      })
    },
    async addPermissions (relation, value) {
      console.log('addPermissions:', relation, value)
      const data = {
        id: String(value.id),
        type: this.ObjectTypes(value.type),
        ref_relation: this.Relations(value.refrel),
        relation: this.Relations(relation)
      }
      await this.fetchAdmin(`/feed_versions/${this.id}/permissions`, data, 'POST')
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
      await this.fetchAdmin(`/feed_versions/${this.id}/permissions`, data, 'DELETE')
      this.getData()
    },
    changed () {
      this.getData()
      this.$emit('changed')
    }
  }
}
</script>
