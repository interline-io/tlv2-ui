<template>
  <div>
    <o-loading v-model:active="loading" :full-page="false" />
    <o-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </o-notification>

    <o-field v-if="actionInfo">
      <tl-admin-perm-list :actions="actionInfo" action-text="This permission level permits the following actions:" :show-user="false" />
    </o-field>

    <hr>

    <tl-search-bar v-model="search" />

    <hr>

    <o-field
      v-if="showUsers"
      label="Users"
      class="mb-4"
    >
      <div v-if="typeMore">
        Begin typing to search
      </div>
      <div v-else-if="!users || users.length === 0">
        No results
      </div>
      <div class="field is-grouped is-grouped-multiline">
        <tl-admin-user-item
          v-for="v of nameSorted(users || [])"
          :key="v.id"
          :user="v"
          action="add"
          @select="$emit('select', { type: 'user', id: $event })"
        />
      </div>
    </o-field>

    <o-field
      v-if="showUserStar"
      class="mb-4"
      label="All users"
    >
      <div class="field is-grouped is-grouped-multiline">
        <template v-if="showUserStar">
          <tl-admin-tenant-item
            key="*"
            :value="userStar"
            action="add"
            @select="$emit('select', { type: 'user', id: $event })"
          />
        </template>
      </div>
    </o-field>

    <o-field
      v-if="showGroups || showTenants"
      label="Groups"
      class="mb-4"
    >
      <div v-if="(!tenants || tenants.length === 0) && (!groups || groups.length === 0)">
        No results
      </div>
      <div v-else>
        <div class="field is-grouped is-grouped-multiline">
          <tl-admin-tenant-item
            v-for="v of nameSorted(tenants || [])"
            :key="v.id"
            :value="v"
            action="add"
            @select="$emit('select', { type: 'tenant', id: $event, refrel: 'member' })"
          />
          <tl-admin-group-item
            v-for="v of nameSorted(groups || [])"
            :key="v.id"
            :value="v"
            action="add"
            @select="$emit('select', { type: 'org', id: $event, refrel: 'viewer' })"
          />
        </div>
      </div>
    </o-field>
  </div>
</template>

<script>
import AuthzMixin from './authz-mixin'

export default {
  mixins: [AuthzMixin],
  props: {
    title: { type: String, default: '' },
    showUsers: { type: Boolean, default: true },
    showGroups: { type: Boolean, default: false },
    showTenants: { type: Boolean, default: false },
    showUserStar: { type: Boolean, default: false },
    actionInfo: { type: Object, default () { return {} } }
  },
  emits: ['select'],
  data () {
    return {
      search: '',
      userStar: {
        id: '*',
        name: 'All users'
      },
      users: [],
      tenants: [],
      groups: [],
      error: null
    }
  },
  computed: {
    typeMore () {
      return (!this.search || this.search.length < 2)
    }
  },
  watch: {
    search (v) { this.getData(v) }
  },
  mounted () { this.getData('') },
  methods: {
    async getData (search) {
      this.loading = true
      // users
      if (search && search.length > 1) {
        await fetch(`${this.apiBase()}/admin/users?q=` + search, {
          headers: { authorization: await this.getAuthToken() }
        })
          .then(this.handleError)
          .then((data) => {
            this.users = (data?.users || []).slice(0, 10)
          })
          .catch(this.setError)
      } else {
        this.users = []
      }

      // groups
      await fetch(`${this.apiBase()}/admin/groups`, {
        headers: { authorization: await this.getAuthToken() }
      })
        .then(this.handleError)
        .then((data) => {
          this.groups = (data?.groups || []).slice(0, 100)
        })
        .catch(this.setError)

      // tenants
      await fetch(`${this.apiBase()}/admin/tenants`, {
        headers: { authorization: await this.getAuthToken() }
      })
        .then(this.handleError)
        .then((data) => {
          this.tenants = (data?.tenants || []).slice(0, 100)
        })
        .catch(this.setError)

      this.loading = false
    }
  }
}
</script>
