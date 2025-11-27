<template>
  <div>
    <button :disabled="disabled" class="button" style="margin-right:10px" @click="saveFile">
      <o-icon icon="download" /> <span>{{ buttonText }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { stringify } from 'csv-stringify/browser/esm/sync'
import { useDownload } from '../composables/useDownload'

interface Props {
  buttonText?: string
  disabled?: boolean
  filename?: string
  data?: Record<string, any>[]
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: 'Download table as CSV',
  disabled: false,
  filename: 'export',
  data: () => []
})

const { downloadFile, getFilename } = useDownload()

function dataToBlob (csvData: Record<string, any>[]): Blob {
  const keys: Record<string, string> = {}
  if (csvData.length > 0 && csvData[0]) {
    for (const k of Object.keys(csvData[0])) {
      keys[k] = k
    }
  }
  const data = stringify(
    csvData,
    {
      header: true,
      columns: keys
    })
  const blob = new Blob([data], { type: 'application/csv' })
  return blob
}

async function saveFile (): Promise<void> {
  const blob = await dataToBlob(props.data)
  const filename = getFilename(props.filename, 'csv')
  downloadFile(blob, filename)
}
</script>
