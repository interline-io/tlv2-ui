<template>
  <div class="flex items-center gap-2">
    <template v-if="feedVersionGtfsImport">
      <o-tooltip
        v-if="feedVersionGtfsImport.schedule_removed"
        label="Agencies, stops, and routes available"
      >
        <o-icon icon="check" />
      </o-tooltip>
      <o-tooltip v-else-if="feedVersionGtfsImport.success" label="Successfully imported and available through Transitland APIs">
        <o-icon icon="check-all" />
      </o-tooltip>
      <o-tooltip v-else-if="feedVersionGtfsImport.in_progress" label="Import in progress">
        <o-icon icon="clock" />
      </o-tooltip>
      <o-tooltip
        v-else-if="feedVersionGtfsImport.success == false"
        :label="`Not available through Transitland REST and GraphQL APIs: ${feedVersionGtfsImport.exception_log || ''}`"
        position="top"
      >
        <o-icon icon="alert" />
      </o-tooltip>
    </template>
    <template v-else-if="showNotImportedStatus">
      <o-tooltip label="Not currently imported into API. Still available for download from the Feed Archive.">
        <o-icon icon="close" class="text-danger" />
      </o-tooltip>
    </template>
  </div>
</template>

<script setup lang="ts">
// TypeScript interfaces
interface FeedVersionGtfsImport {
  success?: boolean | null
  in_progress?: boolean
  schedule_removed?: boolean
  exception_log?: string
}

// Props
withDefaults(defineProps<{
  feedVersionGtfsImport?: FeedVersionGtfsImport | null
  showNotImportedStatus?: boolean
}>(), {
  feedVersionGtfsImport: null,
  showNotImportedStatus: false
})
</script>
