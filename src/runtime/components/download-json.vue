<template>
  <div>
    <button :disabled="disabled" class="button" style="margin-right:10px" @click="saveFile">
      <t-icon icon="download" /> <span>{{ buttonText }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
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

function sanitizeFilename (filename: string): string {
  return filename.replace(/[^\w.-]/g, '_')
}

function saveFile (): void {
  const blob = new Blob([props.data], { type: 'application/json' })
  const e = document.createEvent('MouseEvents')
  const a = document.createElement('a')
  a.download = sanitizeFilename(props.filename + '.json')
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
  e.initEvent('click', true, false)
  a.dispatchEvent(e)
}
</script>
