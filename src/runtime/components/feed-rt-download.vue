<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else>
      <div class="buttons">
        <o-button
          variant="info"
          icon-left="code-json"
          size="small"
          @click="viewJson"
        >
          View as JSON
        </o-button>
        <o-button
          variant="primary"
          icon-left="file-download"
          size="small"
          :loading="loading"
          @click="download('pb')"
        >
          Download as Protocol Buffer
        </o-button>
      </div>
    </div>

    <!-- JSON Viewer Modal -->
    <tl-modal v-model="showJsonModal" :title="`GTFS Realtime: ${rtTypeDisplay}`">
      <div v-if="jsonLoading" class="has-text-centered">
        <o-icon icon="loading" size="large" class="is-spinning" />
        <p class="mt-2">
          Loading JSON data from Transitland API...
        </p>
      </div>
      <div v-else-if="jsonError" class="has-text-centered">
        <tl-msg-error>{{ jsonError }}</tl-msg-error>
      </div>
      <div v-else-if="jsonData" class="json-viewer">
        <!-- Feed Info Section -->
        <div class="feed-info mb-4">
          <div class="columns">
            <div class="column">
              <strong>Feed:</strong> <tl-safelink :text="feedOnestopId" />
            </div>
            <div v-if="lastFetchedAt" class="column">
              <strong>Last Fetched:</strong> {{ lastFetchedAt }}
            </div>
          </div>
        </div>

        <div class="json-controls mb-3">
          <div class="buttons">
            <o-button
              size="small"
              variant="info"
              icon-left="download"
              @click="downloadFromViewer"
            >
              Download as JSON
            </o-button>
            <o-button
              v-if="!isJsonTooLargeToDisplay"
              size="small"
              variant="secondary"
              icon-left="content-copy"
              @click="copyToClipboard"
            >
              Copy as JSON
            </o-button>
          </div>
        </div>
        <div class="json-content">
          <vue-json-pretty
            v-if="!isJsonTooLargeToInteractivelyRender"
            ref="jsonViewerRef"
            :data="jsonData"
            :deep="2"
            :show-length="true"
            :show-line="true"
            :show-icon="true"
            :collapsed-node-length="50"
            theme="light"
            class="json-pretty-viewer"
          />
          <div v-else-if="!isJsonTooLargeToDisplay" class="json-fallback-container">
            <pre class="json-fallback"><code>{{ displayedJson }}</code></pre>
          </div>
          <div v-else class="json-too-large">
            <div class="notification is-warning">
              <p class="has-text-centered">
                <o-icon icon="file-alert" size="large" class="mb-3" />
              </p>
              <p class="has-text-centered">
                <strong>File too large to display</strong>
              </p>
              <p class="has-text-centered is-size-7">
                This JSON file is {{ jsonSizeMbString }}, which may be too large to display here in your web browser.
                Please use the download button above to save the file and view locally.
              </p>
            </div>
          </div>
        </div>

        <div v-if="isJsonTooLargeToInteractivelyRender && !isJsonTooLargeToDisplay" class="notification is-info is-light mt-3">
          <p class="is-size-7">
            <strong>Note:</strong> This JSON file is large ({{ jsonSizeMbString }}), so the interactive JSON tree view is disabled.
          </p>
        </div>
      </div>
    </tl-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { useApiEndpoint } from '../composables/useApiEndpoint'
import { useAuthHeaders } from '../composables/useAuthHeaders'
import { useToastNotification } from '../composables/useToastNotification'

// Type definitions
type RTType = 'alerts' | 'trip_updates' | 'vehicle_positions'

interface RTTypeDisplayMap {
  vehicle_positions: string
  trip_updates: string
  alerts: string
  [key: string]: string
}

// Props validation
const props = withDefaults(defineProps<{
  feedOnestopId: string
  rtType: RTType
  lastFetchedAt?: string | null
}>(), {
  lastFetchedAt: null
})

// Reactive data
const error = ref<string | null>(null)
const loading = ref(false)
const showJsonModal = ref(false)
const jsonData = ref<any>(null)
const jsonLoading = ref(false)
const jsonError = ref<string | null>(null)
const jsonViewerRef = ref<any>(null)

// Composables
const apiEndpoint = useApiEndpoint()
const { showToast } = useToastNotification()

// Computed properties
const rtTypeDisplay = computed<string>(() => {
  const types: RTTypeDisplayMap = {
    vehicle_positions: 'Vehicle Positions',
    trip_updates: 'Trip Updates',
    alerts: 'Service Alerts'
  }
  return types[props.rtType] || props.rtType
})

const formattedJson = computed<string>(() => {
  if (!jsonData.value) return ''
  try {
    return JSON.stringify(jsonData.value, null, 2)
  } catch {
    return JSON.stringify(jsonData.value)
  }
})

const jsonSizeKb = computed<number>(() => {
  if (!formattedJson.value) return 0
  return Math.round(new Blob([formattedJson.value]).size / 1024)
})

const isJsonTooLargeToInteractivelyRender = computed<boolean>(() => {
  // Use plain text for JSON files larger than 2Mb
  return jsonSizeKb.value > 2000
})

const isJsonTooLargeToDisplay = computed<boolean>(() => {
  // Don't display JSON files larger than 20MB at all
  return jsonSizeKb.value > 20000
})

const jsonSizeMbString = computed<string>(() => {
  if (!formattedJson.value) return '0 Mb'
  const sizeKb = Math.round(new Blob([formattedJson.value]).size / 1024)
  const sizeMb = sizeKb / 1024
  return `${sizeMb.toLocaleString()} Mb`
})

const displayedJson = computed<string>(() => {
  return formattedJson.value
})

// Methods
async function download (format: string): Promise<void> {
  loading.value = true
  error.value = null

  const url = `${apiEndpoint}/rest/feeds/${props.feedOnestopId}/download_latest_rt/${props.rtType}.${format}`
  const filename = `${props.feedOnestopId}-${props.rtType}-latest.${format}`

  try {
    const response = await fetch(url, { headers: await useAuthHeaders() })
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(downloadUrl)
  } catch (err: any) {
    console.error('Download failed:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function viewJson (): Promise<void> {
  showJsonModal.value = true
  jsonLoading.value = true
  jsonError.value = null
  jsonData.value = null

  const url = `${apiEndpoint}/rest/feeds/${props.feedOnestopId}/download_latest_rt/${props.rtType}.json`

  try {
    const response = await fetch(url, { headers: await useAuthHeaders() })
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    jsonData.value = await response.json()
  } catch (err: any) {
    console.error('JSON fetch failed:', err)
    jsonError.value = err.message
  } finally {
    jsonLoading.value = false
  }
}

async function downloadFromViewer (): Promise<void> {
  if (!jsonData.value) return

  const filename = `${props.feedOnestopId}-${props.rtType}-latest.json`
  const blob = new Blob([JSON.stringify(jsonData.value, null, 2)], { type: 'application/json' })
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(downloadUrl)
}

async function copyToClipboard (): Promise<void> {
  if (!formattedJson.value) return

  try {
    await navigator.clipboard.writeText(formattedJson.value)
    showToast('Copied to clipboard')
  } catch (err) {
    console.error('Copy to clipboard failed:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = formattedJson.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showToast('Copied to clipboard')
  }
}
</script>

<style scoped>
.json-viewer {
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.json-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.json-controls .buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.json-content {
  flex: 1;
  overflow: auto;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
}

.json-pretty-viewer {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

.json-pretty-viewer :deep(.vjs-tree) {
  background: transparent;
}

.json-pretty-viewer :deep(.vjs-tree__brackets) {
  color: #666;
}

.json-pretty-viewer :deep(.vjs-tree__key) {
  color: #333;
  font-weight: 500;
}

.json-pretty-viewer :deep(.vjs-tree__value) {
  color: #0066cc;
}

.json-pretty-viewer :deep(.vjs-tree__value--string) {
  color: #008800;
}

.json-pretty-viewer :deep(.vjs-tree__value--number) {
  color: #cc6600;
}

.json-pretty-viewer :deep(.vjs-tree__value--boolean) {
  color: #cc0066;
}

.json-pretty-viewer :deep(.vjs-tree__value--null) {
  color: #999;
}

.json-fallback {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #495057;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.json-fallback code {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
  font-family: inherit;
}

.json-fallback-container {
  position: relative;
}

.json-too-large {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.json-too-large .notification {
  max-width: 400px;
  margin: 0 auto;
}

.is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
