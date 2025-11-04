<template>
  <div>
    <client-only placeholder="Map">
      <tl-pages-map
        :search-coords="searchCoords"
        :lon-param="$route.query.lon?.toString()"
        :lat-param="$route.query.lat?.toString()"
        :from-place-param="$route.query.fromPlace?.toString()"
        :to-place-param="$route.query.toPlace?.toString()"
        :mode-param="$route.query.mode?.toString()"
        :depart-at-param="$route.query.departAt?.toString()"
      />
    </client-only>
  </div>
</template>

<script>
import { definePageMeta } from '#imports'

export default {
  computed: {
    searchCoords () {
      const lon = this.$route.query.lon
      const lat = this.$route.query.lat
      if (lon && lat) {
        return [Number.parseFloat(lon), Number.parseFloat(lat)]
      }
      return null
    }
  }
}

definePageMeta({
  layout: 'map'
})
</script>
