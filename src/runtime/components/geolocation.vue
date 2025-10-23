<template>
  <div>
    <span v-if="!locationUse" class="button" @click="watchLocation"><o-icon icon="crosshairs" /></span>
    <span v-if="locationError" class="button"><o-icon icon="crosshairs" /></span>
    <span v-else-if="locationUse && locationLoading" class="button"><o-icon icon="loading" /></span>
    <span v-else-if="locationUse && !locationLoading" class="button"><o-icon icon="crosshairs-gps" /></span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGeolocation } from '@vueuse/core'
import type { UseGeolocationReturn } from '@vueuse/core'

// Types
type Coordinates = [number, number] // [longitude, latitude]

// Emits
const emit = defineEmits<{
  setLocation: [coords: Coordinates]
}>()

// Reactive state
const geo = ref<UseGeolocationReturn | null>(null)
const locationError = ref<string | null>(null)
const locationUse = ref(false)
const locationLoading = ref(false)

// Watch for geolocation coordinates changes
watch(
  () => geo.value?.coords,
  (coords) => {
    const geoInstance = geo.value
    if (!geoInstance || !coords) {
      return
    }

    const { longitude, latitude } = coords

    // Validate coordinates
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      console.log('geo: bad coords:', coords)
      return
    }

    locationUse.value = false
    locationLoading.value = false
    setLocation([longitude, latitude])

    if (geoInstance.pause) {
      console.log('geo: pause')
      geoInstance.pause()
    }
  },
  { deep: true }
)

// Methods
const setLocation = (coords: Coordinates): void => {
  emit('setLocation', coords)
}

const watchLocation = (): void => {
  console.log('watchLocation: start')
  locationUse.value = true
  locationLoading.value = true
  geo.value = useGeolocation()
}
</script>
