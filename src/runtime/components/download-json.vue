<template>
  <div>
    <button :disabled="disabled" class="button" style="margin-right:10px" @click="saveFile">
      <o-icon icon="download" /> <span>{{ buttonText }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useDownload } from '../composables/useDownload'

interface Props {
  buttonText?: string
  disabled?: boolean
  filename?: string
  data?: string
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: 'Download',
  disabled: false,
  filename: 'export',
  data: ''
})

const { downloadFile, getFilename } = useDownload()

function saveFile (): void {
  const blob = new Blob([props.data], { type: 'application/json' })
  const filename = getFilename(props.filename, 'json')
  downloadFile(blob, filename)
}
</script>
