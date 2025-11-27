<template>
  <div
    class="select"
    :class="selectClasses"
  >
    <select
      :value="modelValue"
      :disabled="disabled"
      v-bind="$attrs"
      @change="handleChange"
    >
      <slot />
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Select dropdown component with Bulma styling.
 * Wraps a native select element with v-model support.
 *
 * @component t-select
 * @example
 * <t-select v-model="selectedValue">
 *   <option value="1">Option 1</option>
 *   <option value="2">Option 2</option>
 * </t-select>
 */

interface Props {
  /**
   * The selected value (v-model).
   */
  modelValue?: string | number | boolean | null

  /**
   * Select size variant.
   * @default undefined (normal size)
   */
  size?: 'small' | 'normal' | 'medium' | 'large'

  /**
   * Select color variant.
   */
  variant?: 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger'

  /**
   * Disable the select.
   * @default false
   */
  disabled?: boolean

  /**
   * Make the select full width.
   * @default false
   */
  fullwidth?: boolean

  /**
   * Round the select corners.
   * @default false
   */
  rounded?: boolean

  /**
   * Show loading state.
   * @default false
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  size: undefined,
  variant: undefined,
  disabled: false,
  fullwidth: false,
  rounded: false,
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean | null]
}>()

const selectClasses = computed(() => {
  const classes: string[] = []

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.variant) {
    classes.push(`is-${props.variant}`)
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

function handleChange (event: Event) {
  const target = event.target as HTMLSelectElement
  let value: string | number | boolean | null = target.value

  // Try to preserve the type of the original modelValue
  if (typeof props.modelValue === 'number') {
    value = Number.parseFloat(target.value)
  } else if (typeof props.modelValue === 'boolean') {
    value = target.value === 'true'
  } else if (target.value === 'null') {
    value = null
  }

  emit('update:modelValue', value)
}
</script>

<style scoped>
/* Inherits Bulma select styles from global stylesheet */
</style>
