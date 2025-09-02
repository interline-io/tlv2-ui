<template>
  <div class="container">
    <slot name="title">
      <tl-title :title="staticTitle" :description="staticDescription" />
    </slot>

    <slot name="description" />

    <!-- key is to force update -->
    <tl-operators-table
      :key="adm0Name"
      v-model:search="search"
      v-model:adm0-name="adm0Name"
      v-model:adm1-name="adm1Name"
      v-model:city-name="cityName"
      v-model:merged="merged"
      @clear="clearQuery"
    />

    <slot name="add-operator" />
  </div>
</template>

<script>

export default {
  data () {
    return {
    }
  },
  computed: {
    filteringByOperatorLocation () {
      return (this.$route.query.adm0_name || this.$route.query.adm1_name || this.$route.query.city_name)
    },
    staticTitle () {
      return 'Browse all operators'
    },
    staticDescription () {
      return 'Operators group together source feeds and other relevant data'
    },
    search: {
      get () { return this.$route.query.search },
      set (v) {
        this.$router.replace({ query: { ...this.$route.query, search: v } })
      }
    },
    adm0Name: {
      get () { return this.$route.query.adm0_name },
      set (v) {
        this.$router.replace({ query: { ...this.$route.query, adm0_name: v } })
      }
    },
    adm1Name: {
      get () { return this.$route.query.adm1_name },
      set (v) {
        this.$router.replace({ query: { ...this.$route.query, adm1_name: v } })
      }
    },
    cityName: {
      get () { return this.$route.query.city_name },
      set (v) {
        this.$router.replace({ query: { ...this.$route.query, city_name: v } })
      }
    },
    merged: {
      get () { return this.$route.query.merged },
      set (v) {
        this.$router.replace({ query: { ...this.$route.query, merged: v } })
      }
    }
  },
  methods: {
    clearQuery () {
      this.$router.replace({ query: { } })
    }
  }
}
</script>
