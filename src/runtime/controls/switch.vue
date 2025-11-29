<template>
  <label class="switch" :class="switchClasses">
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

<script setup lang="ts">
import { computed } from 'vue'
import type { SwitchVariant, SwitchSize } from './types'

/**
 * Toggle switch component with v-model support.
 * Supports boolean or custom true/false values.
 *
 * @component t-switch
 * @example
 * <t-switch v-model="enabled">Enable feature</t-switch>
 * <t-switch v-model="status" :true-value="1" :false-value="0">Active</t-switch>
 */

interface Props {
  /**
   * Switch state (v-model).
   */
  modelValue?: boolean | number | string

  /**
   * Value when switch is on.
   * @default true
   */
  trueValue?: boolean | number | string

  /**
   * Value when switch is off.
   * @default false
   */
  falseValue?: boolean | number | string

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
  modelValue: false,
  trueValue: true,
  falseValue: false,
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
  'update:modelValue': [value: boolean | number | string]
}>()

const isChecked = computed(() => {
  return props.modelValue === props.trueValue
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
  emit('update:modelValue', target.checked ? props.trueValue : props.falseValue)
}
</script>

<style scoped>
.switch {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  position: relative;
}

.switch.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch input[type="checkbox"] {
  position: absolute;
  left: 0;
  opacity: 0;
  outline: none;
  z-index: -1;
}

.switch .check {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 2.75em;
  height: 1.575em;
  padding: 0.2em;
  background: #b5b5b5;
  border-radius: 9999px;
  transition: background 150ms ease-out;
  position: relative;
}

.switch .check::before {
  content: "";
  display: block;
  border-radius: 9999px;
  width: 1.175em;
  height: 1.175em;
  background: #fff;
  box-shadow: 0 3px 1px 0 rgba(0, 0, 0, 0.05), 0 2px 2px 0 rgba(0, 0, 0, 0.1), 0 3px 3px 0 rgba(0, 0, 0, 0.05);
  transition: transform 150ms ease-out;
  will-change: transform;
}

.switch input[type="checkbox"]:checked + .check {
  background: #3273dc;
}

.switch input[type="checkbox"]:checked + .check::before {
  transform: translateX(1.175em);
}

.switch .control-label {
  padding-left: 0.5em;
}

.switch.is-small {
  font-size: 0.75rem;
}

.switch.is-medium {
  font-size: 1.25rem;
}

.switch.is-large {
  font-size: 1.5rem;
}

/* Variant colors */
.switch.is-primary input[type="checkbox"]:checked + .check {
  background: #00d1b2;
}

.switch.is-link input[type="checkbox"]:checked + .check {
  background: #485fc7;
}

.switch.is-info input[type="checkbox"]:checked + .check {
  background: #3e8ed0;
}

.switch.is-success input[type="checkbox"]:checked + .check {
  background: #48c78e;
}

.switch.is-warning input[type="checkbox"]:checked + .check {
  background: #ffe08a;
}

.switch.is-danger input[type="checkbox"]:checked + .check {
  background: #f14668;
}

.switch.is-dark input[type="checkbox"]:checked + .check {
  background: #363636;
}

/* Rounded switch style */
.switch.is-rounded .check {
  border-radius: 4px;
}

.switch.is-rounded .check::before {
  border-radius: 2px;
}
</style>
