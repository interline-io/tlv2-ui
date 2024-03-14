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
          <li>
            <nuxt-link :to="{ name: 'admin-tenants'}">
              Tenants
            </nuxt-link>
          </li>
          <li class="is-active">
            <nuxt-link to="{ name: 'admin-tenants-tenantKey', params: { tenantKey: tenantKey}}">
              {{ tenantKey }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </slot>

    <slot name="title">
      <tl-title title="Tenant" />
    </slot>

    <tl-admin-tenant :id="tenantKey" filter-action="can_edit_members" />
  </div>
</template>

<script>
export default {
  props: {
    tenantKey: { type: String, required: true }
  }
}
</script>
