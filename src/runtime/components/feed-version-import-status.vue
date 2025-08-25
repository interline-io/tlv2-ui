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
        :label="`Not available through Transitland REST and GraphQL APIs:${feedVersionGtfsImport.exception_log.join('\n')}`"
        position="top"
      >
        <o-icon icon="alert" />
      </o-tooltip>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    feedVersionGtfsImport: {
      type: Object,
      default: null
    }
  }
}
</script>
