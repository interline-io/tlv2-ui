<template>
  <button class="button mr-2" @click="saveFile">
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import type { Feature, FeatureCollection } from 'geojson'
import { useDownload } from '../composables/useDownload'

// Props
const props = withDefaults(defineProps<{
  features?: Feature[]
  filename?: string
  label?: string
}>(), {
  features: () => [],
  filename: 'export',
  label: 'Download'
})

// Methods
const { downloadFile, getFilename } = useDownload()

const saveFile = () => {
  const data = JSON.stringify({
    type: 'FeatureCollection',
    features: props.features
  } as FeatureCollection)

  const blob = new Blob([data], { type: 'application/json' })
  const filename = getFilename(props.filename.replace(/\.geojson$/, ''), 'geojson')
  downloadFile(blob, filename)
}
</script>
