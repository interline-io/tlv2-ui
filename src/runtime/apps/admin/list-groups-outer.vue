<template>
  <div>
    <tl-apps-admin-group
      v-if="id != null"
      :id="id"
      :editable="false"
      :show-feeds="true"
      :show-members="false"
      :show-actions="false"
      :show-tenant="false"
    />
  </div>
</template>

<script setup lang="ts">
import { useAdminFetch } from './useAdminApi'

const props = withDefaults(defineProps<{
  id?: number | null
}>(), {
  id: null
})

await useAdminFetch<any>(() => `/groups/${props.id}`)
</script>
