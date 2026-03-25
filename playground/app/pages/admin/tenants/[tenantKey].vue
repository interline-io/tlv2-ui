<template>
  <tl-apps-admin-pages-tenant-index :tenant-key="route.params.tenantKey?.toString() || ''" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
