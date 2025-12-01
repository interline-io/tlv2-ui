<template>
  <span class="t-icon" :class="[sizeClass, variantClass]" @click="handleClick">
    <i :class="`mdi mdi-${icon}`" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Icon component using Material Design Icons (MDI).
 *
 * @component t-icon
 * @example
 * <t-icon icon="check" />
 * <t-icon icon="close" size="small" @click="handleClick" />
 * <t-icon icon="loading" size="large" />
 */

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick (event: MouseEvent): void {
  emit('click', event)
}

interface Props {
  /**
   * MDI icon name (without 'mdi-' prefix).
   * @example "check", "close", "alert", "information"
   */
  icon: string

  /**
   * Icon size using Bulma size classes.
   * @default undefined (normal size)
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * Icon variant/color using Bulma color classes.
   * Used to apply has-text-{variant} class.
   */
  variant?: 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger' | 'dark' | 'text' | 'white'
}

const props = defineProps<Props>()

const sizeClass = computed(() => {
  if (!props.size) return ''
  return `is-${props.size}`
})

const variantClass = computed(() => {
  if (!props.variant) return ''
  return `has-text-${props.variant}`
})
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.t-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.5rem;
  width: 1.5rem;

  i {
    font-size: 1.5rem;
  }

  &.is-small {
    height: 1rem;
    width: 1rem;

    i {
      font-size: 1rem;
    }
  }

  &.is-medium {
    height: 2rem;
    width: 2rem;

    i {
      font-size: 2rem;
    }
  }

  &.is-large {
    height: 3rem;
    width: 3rem;

    i {
      font-size: 3rem;
    }
  }
}
</style>
