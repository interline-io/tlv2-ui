<template>
  <p class="control" :class="controlClasses">
    <textarea
      class="textarea"
      :class="textareaClasses"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :rows="rows"
      :cols="cols"
      :wrap="wrap"
      v-bind="$attrs"
      @input="handleInput"
    />
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TextareaVariant, TextareaSize } from './types'

interface Props {
  /**
   * The v-model value of the textarea.
   * @default ''
   */
  modelValue?: string

  /**
   * Placeholder text for the textarea.
   */
  placeholder?: string

  /**
   * The size of the textarea.
   * @values small, normal, medium, large
   */
  size?: TextareaSize

  /**
   * The color variant of the textarea.
   * @values primary, link, info, success, warning, danger, white, light, dark
   */
  variant?: TextareaVariant

  /**
   * Whether the textarea is disabled.
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the textarea is readonly.
   * @default false
   */
  readonly?: boolean

  /**
   * Whether to show the textarea in a loading state.
   * @default false
   */
  loading?: boolean

  /**
   * Whether the textarea has rounded corners.
   * @default false
   */
  rounded?: boolean

  /**
   * Maximum length of the textarea content.
   */
  maxlength?: number

  /**
   * Number of visible text rows.
   * @default 4
   */
  rows?: number

  /**
   * Number of visible text columns.
   */
  cols?: number

  /**
   * How text wraps in the textarea.
   * @values soft, hard, off
   */
  wrap?: 'soft' | 'hard' | 'off'

  /**
   * Make textarea take full width (expanded).
   * @default false
   */
  expanded?: boolean

  /**
   * Disable textarea resizing.
   * @default false
   */
  hasFixedSize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: undefined,
  size: undefined,
  variant: undefined,
  disabled: false,
  readonly: false,
  loading: false,
  rounded: false,
  maxlength: undefined,
  rows: 4,
  cols: undefined,
  wrap: undefined,
  expanded: false,
  hasFixedSize: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const controlClasses = computed(() => {
  const classes: string[] = []

  if (props.loading) {
    classes.push('is-loading')
  }

  if (props.expanded) {
    classes.push('is-expanded')
  }

  return classes
})

const textareaClasses = computed(() => {
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

  if (props.hasFixedSize) {
    classes.push('has-fixed-size')
  }

  return classes
})

function handleInput (event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>
