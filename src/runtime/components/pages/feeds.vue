<template>
  <div>
    <Title>{{ staticTitle }}</Title>
    <Meta name="description" :content="staticDescription" />
    <Meta name="twitter:title" :content="staticTitle" />
    <Meta name="twitter:description" :content="staticDescription" />
    <Meta name="og:title" :content="staticTitle" />
    <Meta name="og:description" :content="staticDescription" />

    <slot name="nav" />
    <slot name="title">
      <h1 class="title">
        Feeds
      </h1>
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
    limit: { type: Number, default: 20 }
  },
  computed: {
    staticTitle() {
      return 'Feeds index'
    },
    staticDescription() {
      return 'An index of data sources indexed in Transitland'
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
