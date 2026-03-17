<template>
  <div v-if="props.stationArea">
    <tl-apps-transfers-breadcrumbs
      :station-area="props.stationArea"
    />

    <tl-title :title="`${props.stationArea.properties.name}: Transfers - Overview of Different Service Conditions`" />

    <tl-apps-transfers-scenario-with-controls
      :station-area="props.stationArea"
      :feed-versions-options="props.feedVersionsOptions"
      :show-controls="false"
    >
      <!-- TODO: fix this report and remove the following notice -->
      <p class="notification is-danger">
        This report is currently disabled.
      </p>
    </tl-apps-transfers-scenario-with-controls>
  </div>
</template>

<script setup lang="ts">
import type { StationHub } from '../types'
import type { UseFeedVersionsOptions } from '../useFeedVersions'

interface Props {
  stationArea: StationHub
  feedVersionsOptions?: UseFeedVersionsOptions
}

const props = defineProps<Props>()
</script>
