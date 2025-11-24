<template>
  <span v-if="scheduleRelationship === 'CANCELED'">
    <abbr :title="`${transferLeg} was scheduled for ${secondsToString(scheduledTime)}`">
      <slot name="canceled">Canceled</slot>
      <span class="has-text-warning"><i class="mdi mdi-rss mdi-16px" /></span>
    </abbr>
  </span>
  <span v-else-if="scheduleRelationship === 'ADDED'">
    <abbr
      title="Added trip detected using real-time stop observation"
    >
      {{ secondsToString(observedTime) }}
      <span class="has-text-warning"><i class="mdi mdi-rss mdi-16px" /></span>
    </abbr>
  </span>
  <span v-else-if="observedTime">
    <abbr
      :title="`${transferLeg} was scheduled for ${secondsToString(scheduledTime)}`"
    >
      {{ secondsToString(observedTime) }}
      <span class="has-text-warning"><i class="mdi mdi-rss mdi-16px" /></span>
    </abbr>
  </span>
  <span v-else>
    {{ secondsToString(scheduledTime) }}
  </span>
</template>

<script setup lang="ts">
import { secondsToString } from '../utils/time-format'

interface Props {
  scheduledTime?: number | null
  observedTime?: number | null
  scheduleRelationship?: string | null
  transferLeg?: string | null
}

const _props = withDefaults(defineProps<Props>(), {
  scheduledTime: null,
  observedTime: null,
  scheduleRelationship: null,
  transferLeg: null
})
</script>

<style scoped lang="scss">
.dotted-underline {
  border-bottom: 1px dotted;
}
</style>
