<template>
  <t-button :disabled="disabled" :icon-left="iconLeft" :icon-right="iconRight" @click="saveFile">
    {{ label }}
  </t-button>
</template>

<script setup lang="ts">
import { stringify } from 'csv-stringify/browser/esm/sync'
import { useDownload } from '../composables/useDownload'

interface Props {
  label?: string
  disabled?: boolean
  filename?: string
  data?: Record<string, any>[]
  iconLeft?: string
  iconRight?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Download table as CSV',
  disabled: false,
  filename: 'export',
  data: () => [],
  iconLeft: 'download',
  iconRight: undefined
})

const { download } = useDownload()

function csvDataToString (csvData: Record<string, any>[]): string {
  const keys: Record<string, string> = {}
  if (csvData.length > 0 && csvData[0]) {
    for (const k of Object.keys(csvData[0])) {
      keys[k] = k
    }
  }
  return stringify(csvData, {
    header: true,
    columns: keys
  })
}

function saveFile (): void {
  const csvString = csvDataToString(props.data)
  download({
    filename: props.filename + '.csv',
    data: csvString,
    mimeType: 'text/csv'
  })
}
</script>
