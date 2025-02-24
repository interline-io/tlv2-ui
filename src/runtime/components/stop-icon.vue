<template>
  <span class="stop-icon" :class="iconClass">
    <o-icon :icon="iconName" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { stopColors } from '../constants/stop-colors'

interface Props {
  location_type: number
}

const props = defineProps<Props>()

const iconName = computed(() => {
  switch (props.location_type) {
    case 1:
      return 'train-station' // Station
    case 2:
      return 'door-open' // Entrance/Exit
    case 3:
      return 'circle-medium' // Generic Node
    case 4:
      return 'circle-medium' // Boarding Area
    case 0:
    default:
      return 'circle-medium' // Stop/Platform
  }
})

const iconClass = computed(() => {
  switch (props.location_type) {
    case 1:
      return 'stop-icon-station'
    case 2:
      return 'stop-icon-entrance' 
    case 3:
      return 'stop-icon-node'
    case 4:
      return 'stop-icon-boarding'
    case 0:
    default:
      return 'stop-icon-stop'
  }
})
</script>

<style scoped>
/* Use shared stop type colors */
.stop-icon-station {
  color: v-bind('stopColors.station');
}

.stop-icon-entrance {
  color: v-bind('stopColors.entrance');
}

.stop-icon-node {
  color: v-bind('stopColors.node');
}

.stop-icon-boarding {
  color: v-bind('stopColors.boarding');
}

.stop-icon-stop {
  color: v-bind('stopColors.stop');
}
</style> 