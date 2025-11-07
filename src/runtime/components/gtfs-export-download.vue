<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else>
      <!-- Collapsible Advanced Transformations -->
      <tl-msg-box
        title="Advanced Transformations"
        :collapsible="true"
        :collapsed="true"
        no-icon
      >
        <div class="field">
          <label class="label">Additional Feed Versions to Merge</label>
          <o-taginput
            v-model="additionalFeedVersions"
            :allow-new="true"
            placeholder="Add feed version SHA1 or ID"
            icon="plus"
            aria-close-label="Remove this feed version"
            expanded
          />
          <p class="help">
            Add additional feed version SHA1s or IDs to merge with this export
          </p>
        </div>

        <div class="field">
          <label class="label">ID Prefix</label>
          <o-input
            v-model="exportOptions.prefix"
            placeholder="e.g., 'agency1_' to prefix all IDs"
            expanded
          />
          <p class="help">
            Add prefix to entity IDs for namespacing when merging feeds
          </p>
        </div>

        <div class="field">
          <label class="label">Prefix Files</label>
          <o-input
            v-model="prefixFilesInput"
            placeholder="routes.txt, trips.txt (comma-separated)"
            expanded
          />
          <p class="help">
            Specific files to apply prefix to (leave empty for all files)
          </p>
        </div>

        <div class="field">
          <label class="label">Shape Simplification</label>
          <o-input
            v-model="exportOptions.simplifyShapes"
            type="number"
            placeholder="Tolerance in meters (e.g., 10.0)"
            step="0.1"
            expanded
          />
          <p class="help">
            Simplify shape geometries to reduce file size
          </p>
        </div>

        <div class="field">
          <label class="label">Options</label>
          <o-field>
            <o-checkbox v-model="exportOptions.normalizeTimezones">
              Normalize timezones (US/Pacific → America/Los_Angeles)
            </o-checkbox>
          </o-field>
          <div class="field">
            <o-checkbox v-model="exportOptions.useBasicRouteTypes">
              Use basic route types (convert extended to core types)
            </o-checkbox>
            <o-tooltip>
              <template #content>
                <p>Converts extended GTFS route types (e.g., 100-1700) to basic types (0-12).</p>
                <p>
                  Learn more about
                  <a
                    href="https://www.transit.land/documentation/concepts/routes/#route-vehicle-types"
                    target="_blank"
                    rel="noopener noreferrer"
                  >route vehicle types</a>.
                </p>
              </template>
              <i class="fas fa-info-circle" style="margin-left: 0.5rem; cursor: help;" />
            </o-tooltip>
          </div>
        </div>
      </tl-msg-box>

      <!-- Action Buttons -->
      <div class="field is-grouped is-grouped-right mt-5">
        <p class="control">
          <button
            class="button"
            @click="handleCancel"
          >
            Cancel
          </button>
        </p>
        <p class="control">
          <button
            class="button is-primary"
            :class="{ 'is-loading': loading }"
            :disabled="loading"
            @click="downloadGtfs"
          >
            Export GTFS
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from '#app'
import { useApiEndpoint } from '../composables/useApiEndpoint'
import { useAuthHeaders } from '../composables/useAuthHeaders'
import { useToastNotification } from '../composables/useToastNotification'
import { useEditorRoutes } from '../composables/useEditorRoutes'

// Types
interface ExportOptions {
  prefix: string
  prefixFiles: string[]
  normalizeTimezones: boolean
  simplifyShapes: number | null
  useBasicRouteTypes: boolean
  setValues: Record<string, string>
}

interface ExportRequest {
  feed_version_keys: string[]
  format: string
  transforms?: {
    prefix?: string
    prefix_files?: string[]
    normalize_timezones?: boolean
    simplify_shapes?: number
    use_basic_route_types?: boolean
    set_values?: Record<string, string>
  }
}

// Props
const props = withDefaults(defineProps<{
  feedVersionSha1?: string | null
  feedVersionId?: string | number | null
  feedKey: string
  feedVersionKey: string | number
  client?: string
}>(), {
  feedVersionSha1: null,
  feedVersionId: null
})

// Reactive state
const loading = ref(false)
const error = ref<string | null>(null)
const prefixFilesInput = ref('')
const additionalFeedVersions = ref<string[]>([])

const exportOptions = ref<ExportOptions>({
  prefix: '',
  prefixFiles: [],
  normalizeTimezones: false,
  simplifyShapes: null,
  useBasicRouteTypes: false,
  setValues: {}
})

// Computed properties
const feedVersionIdentifier = computed(() => {
  return props.feedVersionSha1 || props.feedVersionId
})

const hasValidFeedVersion = computed(() => {
  return !!(props.feedVersionSha1 || props.feedVersionId)
})

// Composables
const router = useRouter()
const editorRoutes = useEditorRoutes()
const { showToast } = useToastNotification()

// Watchers
watch(prefixFilesInput, (newVal: string) => {
  if (newVal.trim()) {
    exportOptions.value.prefixFiles = newVal
      .split(',')
      .map(f => f.trim())
      .filter(f => f)
  } else {
    exportOptions.value.prefixFiles = []
  }
})

// Methods
const handleCancel = () => {
  router.push({
    name: editorRoutes.stations,
    params: {
      feedKey: props.feedKey,
      feedVersionKey: props.feedVersionKey
    }
  })
}

const downloadGtfs = async () => {
  if (!hasValidFeedVersion.value) {
    error.value = 'Feed version identifier is required'
    return
  }

  loading.value = true
  error.value = null

  try {
    // Construct the export URL
    const url = useApiEndpoint('/rest/feed_versions/export', props.client)

    // Build feed version keys array (primary + additional)
    const feedVersionKeys = [feedVersionIdentifier.value as string]
    if (additionalFeedVersions.value.length > 0) {
      feedVersionKeys.push(...additionalFeedVersions.value)
    }

    // Prepare request body
    const requestBody: ExportRequest = {
      feed_version_keys: feedVersionKeys,
      format: 'gtfs_zip'
    }

    // Add transformations if any are configured
    if (
      exportOptions.value.prefix
      || exportOptions.value.normalizeTimezones
      || exportOptions.value.simplifyShapes
      || exportOptions.value.useBasicRouteTypes
      || Object.keys(exportOptions.value.setValues).length > 0
    ) {
      requestBody.transforms = {}

      if (exportOptions.value.prefix) {
        requestBody.transforms.prefix = exportOptions.value.prefix
      }
      if (exportOptions.value.prefixFiles && exportOptions.value.prefixFiles.length > 0) {
        requestBody.transforms.prefix_files = exportOptions.value.prefixFiles
      }
      if (exportOptions.value.normalizeTimezones) {
        requestBody.transforms.normalize_timezones = true
      }
      if (exportOptions.value.simplifyShapes) {
        requestBody.transforms.simplify_shapes = exportOptions.value.simplifyShapes
      }
      if (exportOptions.value.useBasicRouteTypes) {
        requestBody.transforms.use_basic_route_types = true
      }
      if (Object.keys(exportOptions.value.setValues).length > 0) {
        requestBody.transforms.set_values = exportOptions.value.setValues
      }
    }

    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(await useAuthHeaders()),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText || 'Export failed'}`)
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `gtfs-export-${feedVersionIdentifier.value}-${timestamp}.zip`

    // Download the file
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(downloadUrl)

    // Show success notification
    showToast('GTFS export downloaded successfully')

    // Optionally navigate back after successful download
    // handleCancel()
  } catch (err) {
    console.error('GTFS export failed:', err)
    error.value = err instanceof Error ? err.message : 'Export failed'
    showToast(
      `Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    )
  } finally {
    loading.value = false
  }
}
</script>
