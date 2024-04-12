<template>
  <div>
    <slot name="nav">
      <tl-breadcrumbs />
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
