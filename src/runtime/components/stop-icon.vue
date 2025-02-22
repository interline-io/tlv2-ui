<template>
  <span class="stop-icon" :class="iconClass">
    <o-icon :icon="iconName" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
/* if we want to customize colors in the future */
.stop-icon-station {
  color: var(--bulma-link);
}

.stop-icon-entrance {
  color: var(--bulma-link);
}

.stop-icon-node {
  color: var(--bulma-link);
}

.stop-icon-boarding {
  color: var(--bulma-link);
}

.stop-icon-stop {
  color: var(--bulma-link);
}
</style> 