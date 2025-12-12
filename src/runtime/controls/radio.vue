<template>
  <label class="radio t-radio" :class="radioClasses">
    <input
      type="radio"
      :checked="modelValue === nativeValue"
      :disabled="disabled"
      :name="name"
      :value="nativeValue"
      @change="handleChange"
    >
    <slot>{{ label }}</slot>
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
  /** Label text (alternative to using default slot) */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  nativeValue: undefined,
  name: undefined,
  disabled: false,
  variant: undefined,
  size: undefined,
  label: undefined
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

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.t-radio {
  cursor: pointer;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-right: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  input[type="radio"] {
    flex-shrink: 0;
    appearance: none;
    -webkit-appearance: none;
    width: 1.125rem;
    height: 1.125rem;
    border: 2px solid $grey-light;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease-in-out;

    &:hover {
      border-color: $grey;
    }

    &:checked {
      border-color: $primary;
      background-color: transparent;

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: $primary;
        transform: translate(-50%, -50%);
      }
    }
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Variant colors for radio */
  @each $name, $color in ("link": $link, "info": $info, "success": $success, "warning": $warning, "danger": $danger) {
    &.is-#{$name} input[type="radio"]:checked {
      border-color: $color;

      &::after {
        background-color: $color;
      }
    }
  }

  /* Size variants */
  &.is-small {
    font-size: $size-small;

    input[type="radio"] {
      width: 0.875rem;
      height: 0.875rem;
    }
  }

  &.is-medium {
    font-size: $size-medium;

    input[type="radio"] {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  &.is-large {
    font-size: $size-large;

    input[type="radio"] {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
}
</style>
