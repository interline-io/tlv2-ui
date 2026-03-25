<template>
  <div>
    <h2 class="title is-4">
      Feed Version Admin
    </h2>

    <tl-apps-admin-feed-version :id="feedVersionId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const feedId = computed(() => route.params.feedId?.toString() || '')
const feedVersionId = computed(() => route.params.feedVersionId?.toString() || '')
</script>
