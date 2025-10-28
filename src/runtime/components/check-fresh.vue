<template>
  <tl-msg-warning v-if="dataFreshness > 365">
    The GTFS feeds associated with this page were fetched
    {{ dataFreshness }} days ago; use caution or check if newer data is
    available.
  </tl-msg-warning>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  fetched?: string | null
}>(), {
  fetched: null
})

const dataFreshness = computed(() => {
  const daysAgo: number[] = []
  const n = new Date()
  try {
    if (props.fetched) {
      const n2 = Date.parse(props.fetched)
      daysAgo.push(Math.floor((n2 - n.getTime()) / (1000 * 3600 * 24 * -1)))
    }
  } catch {
    // Silently handle parsing errors
  }
  return daysAgo.length > 0 ? Math.max(...daysAgo) : 0
})
</script>
