<template>
  <div class="slider-tick" :class="{ 'is-clickable': !!setValue }" @click="handleClick">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

interface Props {
  /**
   * The value this tick represents.
   */
  value: number
}

const props = defineProps<Props>()

const setValue = inject<((value: number) => void) | undefined>('sliderSetValue', undefined)

function handleClick () {
  if (setValue) {
    setValue(props.value)
  }
}
</script>

<style scoped>
.slider-tick {
  flex: 0 0 auto;
  text-align: center;
  white-space: nowrap;
  font-size: 0.75rem;
  color: #7a7a7a;
}

.slider-tick.is-clickable {
  cursor: pointer;
  user-select: none;
}

.slider-tick.is-clickable:hover {
  color: #485fc7;
}
</style>
