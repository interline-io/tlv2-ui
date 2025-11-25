<template>
  <div v-if="props.stationArea">
    <tl-transitTransfers-breadcrumbs
      :station-area="props.stationArea"
    />

    <tl-title :title="`${props.stationArea.properties.name}: Transfers - Overview of Different Service Conditions`" />

    <tl-transitTransfers-scenario-with-controls
      :station-hubs="[]"
      :station-area="props.stationArea"
      :show-controls="false"
    >
      <!-- TODO: fix this report and remove the following notice -->
      <p class="notification is-danger">
        This report is currently disabled.
      </p>
    </tl-transitTransfers-scenario-with-controls>
  </div>
</template>

<script setup lang="ts">
import type { StationHub } from '../types'

interface Props {
  stationArea: StationHub
}

const props = defineProps<Props>()
</script>
