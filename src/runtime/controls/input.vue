<template>
  <input
    class="input"
    :class="inputClasses"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :maxlength="maxlength"
    :min="min"
    :max="max"
    :step="step"
    v-bind="$attrs"
    @input="handleInput"
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Text input component with Bulma styling.
 * Supports various input types, sizes, colors, and states.
 *
 * @component t-input
 * @example
 * <t-input v-model="value" placeholder="Enter text" />
 * <t-input v-model="email" type="email" variant="primary" />
 * <t-input v-model="number" type="number" size="small" />
 */

interface Props {
  /**
   * Input value (v-model).
   */
  modelValue?: string | number | null

  /**
   * Input type attribute.
   * @default 'text'
   */
  type?: 'text' | 'email' | 'tel' | 'password' | 'url' | 'search' | 'number' | 'date' | 'time' | 'datetime-local' | 'month' | 'week'

  /**
   * Placeholder text.
   */
  placeholder?: string

  /**
   * Input size variant.
   */
  size?: 'small' | 'normal' | 'medium' | 'large'

  /**
   * Input color variant.
   */
  variant?: 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger' | 'white' | 'light' | 'dark'

  /**
   * Disable the input.
   * @default false
   */
  disabled?: boolean

  /**
   * Make input readonly.
   * @default false
   */
  readonly?: boolean

  /**
   * Show loading state.
   * @default false
   */
  loading?: boolean

  /**
   * Use rounded style.
   * @default false
   */
  rounded?: boolean

  /**
   * Make input static (non-interactive display).
   * @default false
   */
  static?: boolean

  /**
   * Maximum length attribute.
   */
  maxlength?: number

  /**
   * Minimum value for number/date inputs.
   */
  min?: number | string

  /**
   * Maximum value for number/date inputs.
   */
  max?: number | string

  /**
   * Step value for number inputs.
   */
  step?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: undefined,
  size: undefined,
  variant: undefined,
  disabled: false,
  readonly: false,
  loading: false,
  rounded: false,
  static: false,
  maxlength: undefined,
  min: undefined,
  max: undefined,
  step: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputClasses = computed(() => {
  const classes: string[] = []

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  if (props.loading) {
    classes.push('is-loading')
  }

  if (props.static) {
    classes.push('is-static')
  }

  return classes
})

function handleInput (event: Event) {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value

  // Convert to number if type is number
  if (props.type === 'number' && value !== '') {
    value = Number.parseFloat(value)
  }

  emit('update:modelValue', value)
}
</script>

<style scoped>
/* Inherits Bulma input styles from global stylesheet */
</style>
