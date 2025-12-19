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

    <t-loading :active="loading" :full-page="false" />

    <t-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </t-notification>

    <ul>
      <li
        v-for="tenant of sortedTenants"
        :key="tenant.id"
      >
        <tl-apps-admin-tenant-item
          :value="tenant"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminFetch } from '../useAdminApi'
import { nameSort } from '../../../lib/util/filters'

interface Tenant {
  id: string
  name: string
  [key: string]: any
}

const { data, error, pending: loading } = await useAdminFetch<{ tenants: Tenant[] }>('/tenants')

const tenants = computed(() => data.value?.tenants || [])
const sortedTenants = computed(() => nameSort(tenants.value) as Tenant[])
</script>
