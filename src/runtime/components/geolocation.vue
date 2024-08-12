<template>
  <div>
    <span v-if="!locationUse" class="button" @click="watchLocation"><o-icon icon="crosshairs" /></span>
    <span v-if="locationError" class="button"><o-icon icon="crosshairs" /></span>
    <span v-else-if="locationUse && locationLoading" class="button"><o-icon icon="loading" /></span>
    <span v-else-if="locationUse && !locationLoading" class="button"><o-icon icon="crosshairs-gps" /></span>
  </div>
</template>

<script>
import { useGeolocation } from '@vueuse/core'

export default {
  emits: ['setLocation'],
  data () {
    return {
      geo: null,
      locationError: null,
      locationUse: false,
      locationLoading: false,
      coords: null
    }
  },
  watch: {
    'geo.coords' () {
      const geo = this.geo
      if (!geo || !geo.coords) {
        return
      }
      if (geo.coords.longitude < -180 || geo.coords.longitude > 180 || geo.coords.latitude < -90 || geo.coords.latitude > 90) {
        console.log('geo: bad coords:', geo.coords)
        return
      }
      this.locationUse = false
      this.locationLoading = false
      this.setLocation([geo.coords.longitude, geo.coords.latitude])
      if (geo.pause) {
        console.log('geo: pause')
        geo.pause()
      }
    }
  },
  methods: {
    setLocation (coords) {
      this.$emit('setLocation', coords)
    },
    watchLocation () {
      console.log('watchLocation: start')
      this.locationUse = true
      this.locationLoading = true
      this.geo = useGeolocation()
    }
  }
}
</script>
