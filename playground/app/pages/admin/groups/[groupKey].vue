<template>
  <tl-apps-admin-pages-group-index :group-key="route.params.groupKey?.toString() || ''" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
