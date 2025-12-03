<template>
  <t-button :icon-left="iconLeft" :icon-right="iconRight" @click="saveFile">
    {{ label }}
  </t-button>
</template>

<script setup lang="ts">
import type { Feature, FeatureCollection } from 'geojson'
import { useDownload } from '../composables/useDownload'

const props = withDefaults(defineProps<{
  features?: Feature[]
  filename?: string
  label?: string
  iconLeft?: string
  iconRight?: string
}>(), {
  features: () => [],
  filename: 'export.geojson',
  label: 'Download',
  iconLeft: 'download',
  iconRight: undefined
})

const { download } = useDownload()

const saveFile = () => {
  const geojson: FeatureCollection = {
    type: 'FeatureCollection',
    features: props.features
  }

  download({
    filename: props.filename + '.geojson',
    data: JSON.stringify(geojson),
    mimeType: 'application/json'
  })
}
</script>
