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

const props = withDefaults(defineProps<{
  /** Switch state (v-model). Type is inferred from trueValue/falseValue or the bound variable. */
  modelValue?: T
  /** Value when switch is on. @default true */
  trueValue?: T
  /** Value when switch is off. @default false */
  falseValue?: T
  /** Disable switch interaction. @default false */
  disabled?: boolean
  /** Label text (alternative to using default slot). */
  label?: string
  /** Switch size. */
  size?: SwitchSize
  /** Color variant for the switch. */
  variant?: SwitchVariant
  /** Use rounded style for the switch. @default false */
  rounded?: boolean
}>(), {
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
    background: var(--bulma-grey);
    border-radius: var(--bulma-radius-rounded);
    transition: background 150ms ease-out;
    position: relative;

    &::before {
      content: "";
      display: block;
      border-radius: var(--bulma-radius-rounded);
      width: 1.175em;
      height: 1.175em;
      background: var(--bulma-white);
      box-shadow: 0 3px 1px 0 rgba(0, 0, 0, 0.05), 0 2px 2px 0 rgba(0, 0, 0, 0.1), 0 3px 3px 0 rgba(0, 0, 0, 0.05);
      transition: transform 150ms ease-out;
      will-change: transform;
    }
  }

  input[type="checkbox"]:checked + .check {
    background: var(--bulma-grey-dark);

    &::before {
      transform: translateX(1.175em);
    }
  }

  .control-label {
    padding-left: 0.5em;
  }

  // Size variants
  @each $name, $var in (
    "small": "--bulma-size-small",
    "medium": "--bulma-size-medium",
    "large": "--bulma-size-large"
  ) {
    &.is-#{$name} {
      font-size: var(#{$var});
    }
  }

  // Color variants
  @each $name, $var in (
    "primary": "--bulma-primary",
    "link": "--bulma-link",
    "info": "--bulma-info",
    "success": "--bulma-success",
    "warning": "--bulma-warning",
    "danger": "--bulma-danger",
    "dark": "--bulma-dark"
  ) {
    &.is-#{$name} input[type="checkbox"]:checked + .check {
      background: var(#{$var});
    }
  }

  // Rounded switch style
  &.is-rounded .check {
    border-radius: var(--bulma-radius);

    &::before {
      border-radius: var(--bulma-radius-small);
    }
  }
}
</style>
