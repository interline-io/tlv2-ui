<template>
  <tl-msg-warning v-if="dataFreshness > 365">
    The GTFS feeds associated with this page were fetched
    {{ dataFreshness }} days ago; use caution or check if newer data is
    available.
  </tl-msg-warning>
</template>

<script>
export default {
  props: {
    fetched: { type: String, default: null }
  },
  computed: {
    dataFreshness() {
      const daysAgo = []
      const n = new Date()
      try {
        const n2 = Date.parse(this.fetched)
        daysAgo.push(Math.floor((n2 - n) / (1000 * 3600 * 24 * -1)))
      } catch {
        console.log("error parsing data freshness")
      }
      return Math.max(...daysAgo)
    }
  }
}
</script>