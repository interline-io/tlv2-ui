<template>
  <div class="control">
    <button
      class="button"
      :class="buttonClasses"
      :disabled="disabled || loading"
      :type="type"
      v-bind="$attrs"
      @click="handleClick"
    >
      <span v-if="loading" class="icon">
        <i class="mdi mdi-loading mdi-spin" />
      </span>
      <slot />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonVariant, ButtonSize } from './types'

/**
 * Button component with Bulma styling.
 * Supports variants, sizes, loading state, and standard button features.
 *
 * @component t-button
 * @example
 * <t-button>Click me</t-button>
 * <t-button variant="primary" @click="handleClick">Save</t-button>
 * <t-button variant="danger" :loading="isLoading">Delete</t-button>
 */

// Inherit native button attributes
defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick (event: MouseEvent): void {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

interface Props {
  /**
   * Button color variant using Bulma color classes.
   */
  variant?: ButtonVariant

  /**
   * Button size using Bulma size classes.
   * @default undefined (normal size)
   */
  size?: ButtonSize

  /**
   * Show loading spinner and disable button.
   * @default false
   */
  loading?: boolean

  /**
   * Disable button interaction.
   * @default false
   */
  disabled?: boolean

  /**
   * Use outlined button style.
   * @default false
   */
  outlined?: boolean

  /**
   * Use inverted button style (for dark backgrounds).
   * @default false
   */
  inverted?: boolean

  /**
   * Make button full width.
   * @default false
   */
  fullwidth?: boolean

  /**
   * Make button rounded.
   * @default false
   */
  rounded?: boolean

  /**
   * HTML button type attribute.
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: undefined,
  size: undefined,
  loading: false,
  disabled: false,
  outlined: false,
  inverted: false,
  fullwidth: false,
  rounded: false,
  type: 'button'
})

const buttonClasses = computed(() => {
  const classes: string[] = []

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.outlined) {
    classes.push('is-outlined')
  }

  if (props.inverted) {
    classes.push('is-inverted')
  }

  if (props.fullwidth) {
    classes.push('is-fullwidth')
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  if (props.loading) {
    classes.push('is-loading')
  }

  return classes
})
</script>

<style scoped>
/* Inherits Bulma button styles from global stylesheet */
</style>
