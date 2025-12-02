<template>
  <div class="t-slider-tick" :class="{ 'is-clickable': !!setValue }" @click="handleClick">
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

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.t-slider-tick {
  flex: 0 0 auto;
  text-align: center;
  white-space: nowrap;
  font-size: $size-small;
  color: $grey;

  &.is-clickable {
    cursor: pointer;
    user-select: none;

    &:hover {
      color: $link;
    }
  }
}
</style>
