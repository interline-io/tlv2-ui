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
      <span v-if="iconLeft && !loading" class="icon is-small">
        <t-icon :icon="iconLeft" />
      </span>
      <span v-if="$slots.default || label">
        <slot>{{ label }}</slot>
      </span>
      <span v-if="iconRight && !loading" class="icon is-small">
        <t-icon :icon="iconRight" />
      </span>
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

  /**
   * Icon to display on the left side of the button.
   * @default undefined
   */
  iconLeft?: string

  /**
   * Icon to display on the right side of the button.
   * @default undefined
   */
  iconRight?: string

  /**
   * Button label text (alternative to using default slot).
   */
  label?: string
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
  type: 'button',
  iconLeft: undefined,
  iconRight: undefined,
  label: undefined
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
