<template>
  <div>
    <slot name="title">
      <tl-title :title="staticTitle" :description="staticDescription" />
    </slot>

    <slot name="description" />

    <tl-feeds-table
      v-model:search="search"
      v-model:import-status="importStatus"
      v-model:feed-specs="feedSpecs"
      v-model:fetch-error="fetchError"
      v-model:tag-unstable-url="tagUnstableUrl"
      :limit="limit"
    />

    <slot name="add-feed" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from '#app'

const props = withDefaults(defineProps<{
  limit?: number
}>(), {
  limit: 100
})

const route = useRoute()
const router = useRouter()

const staticTitle = computed(() => 'Feeds index')
const staticDescription = computed(() => 'An index of data sources')

const search = computed({
  get (): string | undefined {
    return route.query.search as string | undefined
  },
  set (v: string | undefined) {
    router.replace({ query: { ...route.query, search: v } })
  }
})

const fetchError = computed({
  get (): string | undefined {
    return route.query.fetchError as string | undefined
  },
  set (v: string | undefined) {
    router.replace({ query: { ...route.query, fetchError: v } })
  }
})

const importStatus = computed({
  get (): string | undefined {
    return route.query.importStatus as string | undefined
  },
  set (v: string | undefined) {
    router.replace({ query: { ...route.query, importStatus: v } })
  }
})

const feedSpecs = computed({
  get (): string[] {
    const specs = route.query.feedSpecs
    // Handle both string and array values
    return specs ? (Array.isArray(specs) ? specs : [specs]) : ['GTFS', 'GTFS_RT', 'GBFS']
  },
  set (v: string[] | undefined) {
    // If v is empty array or contains all default values, remove query param
    const defaultSpecs = ['GTFS', 'GTFS_RT', 'GBFS']
    const shouldRemoveParam = !v?.length
      || (v.length === defaultSpecs.length && v.every(spec => defaultSpecs.includes(spec)))

    router.replace({
      query: {
        ...route.query,
        feedSpecs: shouldRemoveParam ? undefined : v
      }
    })
  }
})

const tagUnstableUrl = computed({
  get (): string | undefined {
    return route.query.tagUnstableUrl as string | undefined
  },
  set (v: string | undefined) {
    router.replace({ query: { ...route.query, tagUnstableUrl: v } })
  }
})
</script>
