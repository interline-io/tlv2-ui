<template>
  <tl-pages-departures
    :onestop-id="onestopId"
    :search-coords="searchCoords"
    :search-radius="searchRadius"
  />
</template>

<script>
export default {
  computed: {
    onestopId () {
      return this.$route.query.onestopId || null
    },
    searchCoords () {
      const lon = this.$route.query.lon
      const lat = this.$route.query.lat
      if (lon && lat) {
        return [Number.parseFloat(lon), Number.parseFloat(lat)]
      }
      return null
    },
    searchRadius () {
      const r = this.$route.query.radius
      if (r) {
        return Number.parseFloat(r)
      }
      return null
    }
  }
}
</script>
