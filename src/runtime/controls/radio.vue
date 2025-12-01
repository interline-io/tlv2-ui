<template>
  <label class="radio" :class="radioClasses">
    <input
      type="radio"
      :checked="modelValue === nativeValue"
      :disabled="disabled"
      :name="name"
      :value="nativeValue"
      @change="handleChange"
    >
    <slot />
  </label>
</template>

<script setup lang="ts" generic="T extends string | number | boolean | null = string">
import { computed } from 'vue'
import type { RadioVariant, RadioSize } from './types'

/**
 * Radio button component using native HTML radio input with Bulma styling.
 * Type-safe with generic support for different value types.
 *
 * @component t-radio
 * @example
 * <t-radio v-model="selected" native-value="option1" name="choice">Option 1</t-radio>
 * <t-radio v-model="selected" native-value="option2" name="choice">Option 2</t-radio>
 * <t-radio v-model="count" :native-value="1" name="number">One</t-radio>
 */

interface Props {
  /** The v-model value - should match nativeValue when this radio is selected */
  modelValue?: T
  /** The value this radio represents - what gets emitted when selected */
  nativeValue?: T
  /** The name attribute for the radio group - all radios in a group should have the same name */
  name?: string
  /** Whether the radio button is disabled */
  disabled?: boolean
  /** Color variant for the radio button */
  variant?: RadioVariant
  /** Size of the radio button */
  size?: RadioSize
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  nativeValue: undefined,
  name: undefined,
  disabled: false,
  variant: undefined,
  size: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const radioClasses = computed(() => {
  const classes: string[] = []

  if (props.disabled) {
    classes.push('is-disabled')
  }

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  return classes
})

function handleChange () {
  if (!props.disabled && props.nativeValue !== undefined) {
    emit('update:modelValue', props.nativeValue)
  }
}
</script>

<style scoped>
.radio {
  cursor: pointer;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-right: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.radio input[type="radio"] {
  flex-shrink: 0;
}

.radio.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Enhanced radio button styling with padding */
.radio input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid #dbdbdb;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease-in-out;
}

.radio input[type="radio"]:hover {
  border-color: #b5b5b5;
}

.radio input[type="radio"]:checked {
  border-color: #00d1b2;
  background-color: transparent;
}

.radio input[type="radio"]:checked::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00d1b2;
  transform: translate(-50%, -50%);
}

/* Variant colors for radio */
.radio.is-primary input[type="radio"]:checked {
  border-color: #00d1b2;
}

.radio.is-primary input[type="radio"]:checked::after {
  background-color: #00d1b2;
}

.radio.is-link input[type="radio"]:checked {
  border-color: #485fc7;
}

.radio.is-link input[type="radio"]:checked::after {
  background-color: #485fc7;
}

.radio.is-info input[type="radio"]:checked {
  border-color: #3e8ed0;
}

.radio.is-info input[type="radio"]:checked::after {
  background-color: #3e8ed0;
}

.radio.is-success input[type="radio"]:checked {
  border-color: #48c78e;
}

.radio.is-success input[type="radio"]:checked::after {
  background-color: #48c78e;
}

.radio.is-warning input[type="radio"]:checked {
  border-color: #ffe08a;
}

.radio.is-warning input[type="radio"]:checked::after {
  background-color: #ffe08a;
}

.radio.is-danger input[type="radio"]:checked {
  border-color: #f14668;
}

.radio.is-danger input[type="radio"]:checked::after {
  background-color: #f14668;
}

/* Size variants */
.radio.is-small {
  font-size: 0.75rem;
}

.radio.is-small input[type="radio"] {
  width: 0.875rem;
  height: 0.875rem;
}

.radio.is-medium {
  font-size: 1.25rem;
}

.radio.is-medium input[type="radio"] {
  width: 1.25rem;
  height: 1.25rem;
}

.radio.is-large {
  font-size: 1.5rem;
}

.radio.is-large input[type="radio"] {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
