<template>
  <div>
    <slot name="title">
      <tl-title title="Tenants" />
    </slot>

    <slot name="description">
      <p class="content">
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
        v-for="tenant of nameSort(tenants)"
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
import Loadable from '../../loadable'
import { nameSort } from '../../../lib/filters'

export default {
  mixins: [Loadable],
  data () {
    return {
      tenants: []
    }
  },
  mounted () { this.getData() },
  methods: {
    nameSort,
    async getData () {
      return await this.fetchAdmin('/tenants').then((data) => {
        this.tenants = data.tenants
      })
    }
  }
}
</script>
