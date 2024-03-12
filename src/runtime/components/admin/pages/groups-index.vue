<template>
  <div>
    <slot name="nav">
      <nav class="breadcrumb box" aria-label="breadcrumbs">
        <ul>
          <li>
            <nuxt-link :to="{ name: 'admin'}">
              Admin
            </nuxt-link>
          </li>
          <li class="is-active">
            <nuxt-link :to="{ name: 'admin-groups'}">
              Groups
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </slot>

    <slot name="title">
      <tl-title title="Groups" />
    </slot>

    <slot name="description">
      <p class="content is-medium">
        Your user belongs to the following groups. Each group grants access to one or more associated feeds and their feed versions.
      </p>
    </slot>

    <div v-for="v of groups" :key="v.id">
      <tl-msg-info no-icon :title="v.name" variant="light">
        <tl-admin-group :id="v.id" />
      </tl-msg-info>
    </div>
  </div>
</template>

<script>
import AuthzMixin from '../authz-mixin'

export default {
  mixins: [AuthzMixin],
  data () {
    return {
      groups: [],
      error: null
    }
  },
  mounted () { this.getData() },
  methods: {
    async getData () {
      this.loading = true
      await fetch(`${this.apiBase()}/admin/groups`, {
        headers: { authorization: await this.getAuthToken() }
      }).then((data) => {
        return data.json()
      }).then((data) => {
        this.groups = data.groups
      })
      this.loading = false
    }
  }
}
</script>
