<template>
  <div>
    <slot name="title">
      <tl-title :title="staticTitle" :description="staticDescription" />
    </slot>

    <slot name="description" />

    <tl-feeds-table
      v-model:search="search"
      v-model:importStatus="importStatus"
      v-model:feedSpecs="feedSpecs"
      v-model:fetchError="fetchError"
      v-model:tagUnstableUrl="tagUnstableUrl"
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
    staticTitle() {
      return 'Feeds index'
    },
    staticDescription() {
      return 'An index of data souurces'
    },
    search: {
      get() { return this.$route.query.search },
      set(v) {
        this.$router.replace({ query: { ...this.$route.query, search: v } })
      }
    },
    fetchError: {
      get() { return this.$route.query.fetchError },
      set(v) {
        this.$router.replace({ query: { ...this.$route.query, fetchError: v } })
      }
    },
    importStatus: {
      get() { return this.$route.query.importStatus },
      set(v) {
        this.$router.replace({ query: { ...this.$route.query, importStatus: v } })
      }
    },
    feedSpecs: {
      get() { return this.$route.query.feedSpecs },
      set(v) {
        this.$router.replace({ query: { ...this.$route.query, feedSpecs: v } })
      }
    },
    tagUnstableUrl: {
      get() { return this.$route.query.tagUnstableUrl },
      set(v) {
        this.$router.replace({ query: { ...this.$route.query, tagUnstableUrl: v } })
      }
    }
  }
}
</script>

<style scoped>
pre.tags {
  padding: 1px;
  font-size: 0.8em;
}
</style>
