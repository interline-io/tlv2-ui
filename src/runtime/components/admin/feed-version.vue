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
import { useUser } from '../../plugins/auth'
import AuthzMixin from './authz-mixin'

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
    id: { type: [String, Number], required: true }
  },
  emits: ['changed'],
  apollo: {
    fvs: {
      client: 'transitland',
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
      this.loading = true
      await fetch(`${this.apiBase}/admin/feed_versions/${this.id}`, {
        headers: { authorization: await this.authBearer() }
      })
        .then(this.handleError)
        .then((data) => {
          this.perms = data
        })
        .catch(this.setError)
      this.loading = false
    },
    async addPermissions (relation, value) {
      console.log('addPermissions:', relation, value)
      await fetch(
        `${this.apiBase}/admin/feed_versions/${this.id}/permissions`, {
          method: 'POST',
          headers: { authorization: await this.authBearer() },
          body: JSON.stringify({
            id: String(value.id),
            type: this.ObjectTypes(value.type),
            ref_relation: this.Relations(value.refrel),
            relation: this.Relations(relation)
          })
        }
      )
      this.getData()
    },
    async removePermissions (relation, value) {
      console.log('removePermissions:', relation, value)
      await fetch(
        `${this.apiBase}/admin/feed_versions/${this.id}/permissions`, {
          method: 'DELETE',
          headers: { authorization: await this.authBearer() },
          body: JSON.stringify({
            id: String(value.id),
            type: this.ObjectTypes(value.type),
            ref_relation: this.Relations(value.refrel),
            relation: this.Relations(relation)
          })

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
