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
            <div v-if="isJsonTruncated" class="json-truncated-info">
              <div class="notification is-warning is-light">
                <p class="is-size-7">
                  <strong>Large file truncated:</strong> Showing first {{ truncateAtKb }} KB of {{ jsonSizeMbString }} file.
                  <a class="has-text-link" @click="showFullJson = true">Show full content</a> or use the download button above.
                </p>
              </div>
            </div>
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

<script>
import Loadable from './loadable'
import { useToastNotification } from '../composables/useToastNotification'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
export default {
  components: {
    VueJsonPretty
  },
  mixins: [Loadable],
  props: {
    feedOnestopId: { type: String, required: true },
    rtType: {
      type: String,
      required: true,
      validator: value => ['alerts', 'trip_updates', 'vehicle_positions'].includes(value)
    },
    lastFetchedAt: { type: String, default: null }
  },
  data () {
    return {
      showJsonModal: false,
      jsonData: null,
      jsonLoading: false,
      jsonError: null,
      jsonViewerRef: null,
      showFullJson: false
    }
  },
  computed: {
    rtTypeDisplay () {
      const types = {
        vehicle_positions: 'Vehicle Positions',
        trip_updates: 'Trip Updates',
        alerts: 'Service Alerts'
      }
      return types[this.rtType] || this.rtType
    },
    formattedJson () {
      if (!this.jsonData) return ''
      try {
        return JSON.stringify(this.jsonData, null, 2)
      } catch (e) {
        return JSON.stringify(this.jsonData)
      }
    },
    jsonSizeKb () {
      if (!this.formattedJson) return 0
      return Math.round(new Blob([this.formattedJson]).size / 1024)
    },
    isJsonTooLargeToInteractivelyRender () {
      // Use plain text for JSON files larger than 2Mb
      return this.jsonSizeKb > 2000
    },
    isJsonTooLargeToDisplay () {
      // Don't display JSON files larger than 20MB at all
      return this.jsonSizeKb > 20000
    },
    jsonSizeMbString () {
      if (!this.formattedJson) return '0 Mb'
      const sizeKb = Math.round(new Blob([this.formattedJson]).size / 1024)
      const sizeMb = sizeKb / 1024
      return `${sizeMb.toLocaleString()} Mb`
    },
    truncateAtKb () {
      return 1000 // Truncate at 1MB for display
    },
    isJsonTruncated () {
      return this.isJsonTooLarge && this.jsonSizeKb > this.truncateAtKb && !this.showFullJson
    },
    displayedJson () {
      if (!this.isJsonTooLarge || this.showFullJson) {
        return this.formattedJson
      }

      // Truncate the JSON string to approximately 1MB
      const targetBytes = this.truncateAtKb * 1024
      let truncated = this.formattedJson.substring(0, targetBytes)

      // Try to end at a reasonable point (end of a line)
      const lastNewline = truncated.lastIndexOf('\n')
      if (lastNewline > targetBytes * 0.8) { // If we're close to the target, use the newline
        truncated = truncated.substring(0, lastNewline)
      }

      return truncated + '\n\n... (truncated for display performance)'
    }
  },
  methods: {
    async download (format) {
      this.loading = true
      this.error = null

      const url = `${this.apiEndpoint()}/rest/feeds/${this.feedOnestopId}/download_latest_rt/${this.rtType}.${format}`
      const filename = `${this.feedOnestopId}-${this.rtType}-latest.${format}`

      try {
        const response = await fetch(url, { headers: await this.authHeaders() })
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
      } catch (err) {
        console.error('Download failed:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async viewJson () {
      this.showJsonModal = true
      this.jsonLoading = true
      this.jsonError = null
      this.jsonData = null

      const url = `${this.apiEndpoint()}/rest/feeds/${this.feedOnestopId}/download_latest_rt/${this.rtType}.json`

      try {
        const response = await fetch(url, { headers: await this.authHeaders() })
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`)
        }

        this.jsonData = await response.json()
      } catch (err) {
        console.error('JSON fetch failed:', err)
        this.jsonError = err.message
      } finally {
        this.jsonLoading = false
      }
    },

    async downloadFromViewer () {
      if (!this.jsonData) return

      const filename = `${this.feedOnestopId}-${this.rtType}-latest.json`
      const blob = new Blob([JSON.stringify(this.jsonData, null, 2)], { type: 'application/json' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
    },

    async copyToClipboard () {
      if (!this.formattedJson) return

      try {
        await navigator.clipboard.writeText(this.formattedJson)
        useToastNotification().showToast('Copied to clipboard')
      } catch (err) {
        console.error('Copy to clipboard failed:', err)
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = this.formattedJson
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        useToastNotification().showToast('Copied to clipboard')
      }
    },
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

.json-truncated-info {
  margin-top: 1rem;
}

.json-truncated-info .notification {
  margin-bottom: 0;
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
