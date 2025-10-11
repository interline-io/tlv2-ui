<template>
  <button class="button mr-2" @click="saveFile">
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import { sanitizeFilename } from '../lib/sanitize'

// Types
interface GeoJSONFeature {
  type: 'Feature'
  geometry: any
  properties?: Record<string, any>
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

// Props
const props = withDefaults(defineProps<{
  features?: GeoJSONFeature[]
  filename?: string
  label?: string
}>(), {
  features: () => [],
  filename: 'export.geojson',
  label: 'Download'
})

// Methods
const saveFile = () => {
  const data = JSON.stringify({
    type: 'FeatureCollection',
    features: props.features
  } as GeoJSONFeatureCollection)

  const blob = new Blob([data], { type: 'application/json' })
  const a = document.createElement('a')

  a.download = sanitizeFilename(props.filename + '.geojson')
  a.href = window.URL.createObjectURL(blob)
  a.style.display = 'none'

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(a.href)
}
</script>
