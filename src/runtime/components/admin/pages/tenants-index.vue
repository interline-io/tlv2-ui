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
            <nuxt-link :to="{ name: 'admin-tenants'}">
              Tenants
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </slot>

    <slot name="title">
      <tl-title title="Tenants" />
    </slot>

    <slot name="description">
      <p class="content is-medium">
        Tenants are used by system administrators to organize groups and additional authorization information.
      </p>
    </slot>

    <o-loading v-model:active="loading" :full-page="false" />

    <o-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </o-notification>

    <ul>
      <li
        v-for="tenant of nameSorted(tenants)"
        :key="tenant.id"
      >
        <nuxt-link :to="{ name: 'admin-tenants-tenantKey', params: { tenantKey: tenant.id } }">
          <span v-if="tenant.name">{{ tenant.name }}</span>
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
import AuthzMixin from '../authz-mixin'

export default {
  mixins: [AuthzMixin],
  data () {
    return {
      tenants: [],
      error: null
    }
  },
  mounted () { this.getData() },
  methods: {
    async getData () {
      this.loading = true
      await fetch(`${this.apiBase()}/admin/tenants`, {
        headers: { authorization: await this.getAuthToken() }
      }).then((data) => {
        return data.json()
      }).then((data) => {
        this.tenants = data.tenants
      })
      this.loading = false
    }
  }
}
</script>
