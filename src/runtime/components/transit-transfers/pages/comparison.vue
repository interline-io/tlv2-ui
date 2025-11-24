<template>
  <div v-if="props.stationArea">
    <transit-transfers-breadcrumbs
      :station-area="props.stationArea"
    />

    <tl-title :title="`${props.stationArea.properties.name}: Transfers - Overview of Different Service Conditions`" />

    <transit-transfers-scenario-with-controls
      :station-hubs="[]"
      :station-area="props.stationArea"
      :show-controls="false"
    >
      <!-- TODO: fix this report and remove the following notice -->
      <p class="notification is-danger">
        This report is currently disabled.
      </p>
    </transit-transfers-scenario-with-controls>
  </div>
</template>

<script setup lang="ts">
import type { StationHub } from '../types'

interface Props {
  stationArea: StationHub
}

const props = defineProps<Props>()
</script>
