<template>
  <t-button :disabled="disabled" :icon-left="iconLeft" :icon-right="iconRight" @click="saveFile">
    {{ label }}
  </t-button>
</template>

<script setup lang="ts">
import { useDownload } from '../composables/useDownload'

interface Props {
  label?: string
  disabled?: boolean
  filename?: string
  data?: string
  iconLeft?: string
  iconRight?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Download',
  disabled: false,
  filename: 'export',
  data: '',
  iconLeft: 'download',
  iconRight: undefined
})

const { download } = useDownload()

function saveFile (): void {
  download({
    filename: props.filename + '.json',
    data: props.data,
    mimeType: 'application/json'
  })
}
</script>
