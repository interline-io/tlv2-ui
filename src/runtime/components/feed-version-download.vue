<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <o-button v-else-if="loading" disabled>
      Downloading... please wait.
    </o-button>
    <o-button v-else variant="primary" icon-left="download" @click="download">
      {{ text }}
    </o-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useApiEndpoint } from '../composables/useApiEndpoint'
import { useAuthHeaders } from '../composables/useAuthHeaders'

// Props
const props = withDefaults(defineProps<{
  text?: string
  feedOnestopId: string
  feedVersionSha1?: string
  latest?: boolean
}>(), {
  text: 'Download',
  feedVersionSha1: '',
  latest: false
})

// Reactive state
const loading = ref(false)
const error = ref<string | null>(null)

// Composables
const apiEndpoint = useApiEndpoint()
const authHeaders = useAuthHeaders()

// Methods
const download = async (): Promise<void> => {
  loading.value = true
  error.value = null

  console.log('download')

  const url = props.latest
    ? `${apiEndpoint}/rest/feeds/${props.feedOnestopId}/download_latest_feed_version`
    : `${apiEndpoint}/rest/feed_versions/${props.feedVersionSha1}/download`

  let filename = ''

  try {
    const result = await fetch(url, { headers: await authHeaders })

    if (!result.ok) {
      throw new Error(result.status + ' ' + result.statusText)
    }

    filename = `${props.feedOnestopId}-latest.zip`
    if (props.feedVersionSha1) {
      filename = `${props.feedOnestopId}-${props.feedVersionSha1}.zip`
    }

    // const header = result.headers.get('Content-Disposition')
    // const parts = (header || '').split(';')
    // if (parts.length > 1) {
    //   filename = parts[1].split('=')[1].replaceAll('"', '')
    // }

    const blob = await result.blob()
    loading.value = false

    if (blob != null) {
      console.log('download: got blob')
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
    }
  } catch (err) {
    console.log('download: failed', err)
    loading.value = false
    error.value = err instanceof Error ? err.message : 'Download failed'
  }
}
</script>
