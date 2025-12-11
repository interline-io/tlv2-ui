<template>
  <div>
    <slot name="title">
      <tl-title title="Tenant" />
    </slot>

    <tl-apps-admin-tenant :id="tenantKey" filter-action="can_edit_members" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tenantKey: string
}>()
</script>
