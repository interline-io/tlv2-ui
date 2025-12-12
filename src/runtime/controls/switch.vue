<template>
  <label class="switch t-switch" :class="switchClasses">
    <input
      type="checkbox"
      :checked="isChecked"
      :disabled="disabled"
      @change="handleChange"
    >
    <span class="check" />
    <span v-if="$slots.default || label" class="control-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts" generic="T extends boolean | string | number = boolean">
import { computed } from 'vue'
import type { SwitchVariant, SwitchSize } from './types'

/**
 * Toggle switch component with v-model support.
 * Supports boolean or custom true/false values with type safety.
 *
 * @component t-switch
 * @example
 * <t-switch v-model="enabled">Enable feature</t-switch>
 * <t-switch v-model="status" :true-value="1" :false-value="0">Active</t-switch>
 * <t-switch v-model="mode" true-value="dark" false-value="light">Dark Mode</t-switch>
 */

interface Props {
  /**
   * Switch state (v-model).
   * Type is inferred from trueValue/falseValue or the bound variable.
   */
  modelValue?: T

  /**
   * Value when switch is on.
   * @default true
   */
  trueValue?: T

  /**
   * Value when switch is off.
   * @default false
   */
  falseValue?: T

  /**
   * Disable switch interaction.
   * @default false
   */
  disabled?: boolean

  /**
   * Label text (alternative to using default slot).
   */
  label?: string

  /**
   * Switch size.
   */
  size?: SwitchSize

  /**
   * Color variant for the switch.
   */
  variant?: SwitchVariant

  /**
   * Use rounded style for the switch.
   * @default false
   */
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  trueValue: undefined,
  falseValue: undefined,
  disabled: false,
  label: undefined,
  size: undefined,
  variant: undefined,
  rounded: false
})

/**
 * Emitted when switch state changes.
 * @event update:modelValue
 */
const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const isChecked = computed(() => {
  const trueVal = props.trueValue !== undefined ? props.trueValue : true as T
  return props.modelValue === trueVal
})

const switchClasses = computed(() => {
  const classes: string[] = []

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.disabled) {
    classes.push('is-disabled')
  }

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  return classes
})

function handleChange (event: Event) {
  const target = event.target as HTMLInputElement
  const trueVal = props.trueValue !== undefined ? props.trueValue : true as T
  const falseVal = props.falseValue !== undefined ? props.falseValue : false as T
  const newValue = target.checked ? trueVal : falseVal
  emit('update:modelValue', newValue)
}
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.t-switch {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  position: relative;

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  input[type="checkbox"] {
    position: absolute;
    left: 0;
    opacity: 0;
    outline: none;
    z-index: -1;
  }

  .check {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    width: 2.75em;
    height: 1.575em;
    padding: 0.2em;
    background: $grey;
    border-radius: $radius-rounded;
    transition: background 150ms ease-out;
    position: relative;

    &::before {
      content: "";
      display: block;
      border-radius: $radius-rounded;
      width: 1.175em;
      height: 1.175em;
      background: $white;
      box-shadow: 0 3px 1px 0 rgba($black, 0.05), 0 2px 2px 0 rgba($black, 0.1), 0 3px 3px 0 rgba($black, 0.05);
      transition: transform 150ms ease-out;
      will-change: transform;
    }
  }

  input[type="checkbox"]:checked + .check {
    background: $link;

    &::before {
      transform: translateX(1.175em);
    }
  }

  .control-label {
    padding-left: 0.5em;
  }

  // Size variants
  &.is-small {
    font-size: $size-small;
  }

  &.is-medium {
    font-size: $size-medium;
  }

  &.is-large {
    font-size: $size-large;
  }

  // Color variants
  @each $name, $color in ("primary": $primary, "link": $link, "info": $info, "success": $success, "warning": $warning, "danger": $danger, "dark": $dark) {
    &.is-#{$name} input[type="checkbox"]:checked + .check {
      background: $color;
    }
  }

  // Rounded switch style
  &.is-rounded .check {
    border-radius: $radius;

    &::before {
      border-radius: $radius-small;
    }
  }
}
</style>
