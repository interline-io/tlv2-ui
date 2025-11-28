<template>
  <div v-if="hasIcons" class="control" :class="controlClasses">
    <input
      class="input"
      :class="inputClasses"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly || static"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :step="step"
      v-bind="$attrs"
      @input="handleInput"
    >
    <span v-if="icon" class="icon is-left">
      <i :class="`mdi mdi-${icon}`" />
    </span>
    <span
      v-if="iconRight"
      class="icon is-right"
      :class="{ 'is-clickable': iconRightClickable }"
      :style="iconRightClickable ? 'cursor: pointer; pointer-events: all;' : ''"
      @click="handleIconRightClick"
    >
      <i :class="`mdi mdi-${iconRight}`" />
    </span>
  </div>
  <p v-else class="control" :class="controlClasses">
    <input
      class="input"
      :class="inputClasses"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly || static"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :step="step"
      v-bind="$attrs"
      @input="handleInput"
    >
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Text input component with Bulma styling.
 * Supports various input types, sizes, colors, states, and icons.
 *
 * @component t-input
 * @example
 * <t-input v-model="value" placeholder="Enter text" />
 * <t-input v-model="email" type="email" variant="primary" />
 * <t-input v-model="search" icon="magnify" icon-right="close-circle" icon-right-clickable @icon-right-click="clear" />
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
  maxlength?: number | string

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

  /**
   * Left icon (MDI icon name without 'mdi-' prefix).
   */
  icon?: string

  /**
   * Right icon (MDI icon name without 'mdi-' prefix).
   */
  iconRight?: string

  /**
   * Make right icon clickable.
   * @default false
   */
  iconRightClickable?: boolean

  /**
   * Make input take full width (expanded).
   * @default false
   */
  expanded?: boolean
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
  step: undefined,
  icon: undefined,
  iconRight: undefined,
  iconRightClickable: false,
  expanded: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'icon-right-click': [event: MouseEvent]
}>()

const hasIcons = computed(() => !!(props.icon || props.iconRight || props.loading))

const controlClasses = computed(() => {
  const classes: string[] = []

  if (props.icon) {
    classes.push('has-icons-left')
  }

  if (props.iconRight) {
    classes.push('has-icons-right')
  }

  if (props.loading) {
    classes.push('is-loading')
  }

  if (props.expanded) {
    classes.push('is-expanded')
  }

  return classes
})

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

function handleIconRightClick (event: MouseEvent) {
  if (props.iconRightClickable) {
    emit('icon-right-click', event)
  }
}
</script>

<style scoped>
/* Inherits Bulma input styles from global stylesheet */
</style>
