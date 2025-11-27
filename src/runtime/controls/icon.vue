<template>
  <span class="icon" :class="[sizeClass, variantClass]">
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
 * <t-icon icon="close" size="small" />
 * <t-icon icon="loading" size="large" />
 */

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

<style scoped>
/* Inherits Bulma icon and MDI styles from global stylesheet */
</style>
