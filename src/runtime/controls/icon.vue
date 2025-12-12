<template>
  <span class="icon" :class="[sizeClass, variantClass]" @click="handleClick">
    <i :class="iconClass" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Icon component using Material Design Icons (MDI) with Bulma's icon container.
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

const iconClass = computed(() => {
  const classes = ['mdi', `mdi-${props.icon}`]
  // Add MDI size classes to match Bulma container sizes.
  // MDI default is ~18px which works for 'small'.
  // Each size needs explicit MDI sizing to fill the Bulma container properly.
  if (props.size === 'small') {
    // Small uses default MDI size (~18px)
  } else if (props.size === 'medium') {
    classes.push('mdi-36px')
  } else if (props.size === 'large') {
    classes.push('mdi-48px')
  } else {
    // Normal/default size
    classes.push('mdi-24px')
  }
  return classes
})
</script>
