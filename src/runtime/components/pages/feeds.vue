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

<script>
export default {
  props: {
    limit: { type: Number, default: 100 }
  },
  computed: {
    staticTitle () {
      return 'Feeds index'
    },
    staticDescription () {
      return 'An index of data souurces'
    },
    search: {
      get () { return this.$route.query.search },
      set (v) {
        this.$router.replace({ query: { ...this.$route.query, search: v } })
      }
    },
    fetchError: {
      get () { return this.$route.query.fetchError },
      set (v) {
        this.$router.replace({ query: { ...this.$route.query, fetchError: v } })
      }
    },
    importStatus: {
      get () { return this.$route.query.importStatus },
      set (v) {
        this.$router.replace({ query: { ...this.$route.query, importStatus: v } })
      }
    },
    feedSpecs: {
      get () {
        const specs = this.$route.query.feedSpecs
        // Handle both string and array values
        return specs ? (Array.isArray(specs) ? specs : [specs]) : ['GTFS', 'GTFS_RT', 'GBFS']
      },
      set (v) {
        // If v is empty array or contains all default values, remove query param
        const defaultSpecs = ['GTFS', 'GTFS_RT', 'GBFS']
        const shouldRemoveParam = !v?.length
          || (v.length === defaultSpecs.length && v.every(spec => defaultSpecs.includes(spec)))

        this.$router.replace({
          query: {
            ...this.$route.query,
            feedSpecs: shouldRemoveParam ? undefined : v
          }
        })
      }
    },
    tagUnstableUrl: {
      get () { return this.$route.query.tagUnstableUrl },
      set (v) {
        this.$router.replace({ query: { ...this.$route.query, tagUnstableUrl: v } })
      }
    }
  }
}
</script>
