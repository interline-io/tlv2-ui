<template>
  <label class="checkbox" :class="checkboxClasses">
    <input
      ref="inputRef"
      type="checkbox"
      :checked="isChecked"
      :disabled="disabled"
      @change="handleChange"
    >
    <slot>{{ label }}</slot>
  </label>
</template>

<script setup lang="ts" generic="T extends boolean | any[] = boolean">
import { ref, watch, onMounted, computed } from 'vue'
import type { CheckboxVariant, CheckboxSize } from './types'

/**
 * Checkbox input component with v-model support.
 * Follows Bulma checkbox styling with indeterminate state support.
 *
 * @component t-checkbox
 * @example
 * <t-checkbox v-model="checked">Accept terms</t-checkbox>
 * <t-checkbox v-model="checked" disabled>Disabled option</t-checkbox>
 * <t-checkbox v-model="options" native-value="option1">Option 1</t-checkbox>
 */

interface Props {
  /**
   * Checkbox checked state (v-model).
   * Type is inferred: boolean for single checkbox, array for checkbox groups.
   */
  modelValue?: T

  /**
   * Value to add/remove from array when used with array binding.
   * Required when modelValue is an array.
   */
  nativeValue?: T extends any[] ? T[number] : never

  /**
   * Disable checkbox interaction.
   * @default false
   */
  disabled?: boolean

  /**
   * Show indeterminate state (visual only, for parent checkboxes).
   * @default false
   */
  indeterminate?: boolean

  /**
   * Label text (alternative to using default slot).
   */
  label?: string

  /**
   * Color variant for the checkbox.
   */
  variant?: CheckboxVariant

  /**
   * Size of the checkbox.
   */
  size?: CheckboxSize
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  nativeValue: undefined,
  disabled: false,
  indeterminate: false,
  label: undefined,
  variant: undefined,
  size: undefined
})

/**
 * Emitted when checkbox state changes.
 * @event update:modelValue
 */
const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.nativeValue !== undefined && props.modelValue.includes(props.nativeValue)
  }
  return props.modelValue as boolean
})

const checkboxClasses = computed(() => {
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

function handleChange (event: Event) {
  const target = event.target as HTMLInputElement

  if (Array.isArray(props.modelValue)) {
    // Array binding mode
    const newValue = [...props.modelValue]
    if (target.checked) {
      // Add to array if not present
      if (!newValue.includes(props.nativeValue)) {
        newValue.push(props.nativeValue)
      }
    } else {
      // Remove from array
      const index = newValue.indexOf(props.nativeValue)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
    emit('update:modelValue', newValue as T)
  } else {
    // Boolean binding mode
    emit('update:modelValue', target.checked as T)
  }
}

function updateIndeterminate () {
  if (inputRef.value) {
    inputRef.value.indeterminate = props.indeterminate
  }
}

// Update indeterminate state when prop changes
watch(() => props.indeterminate, updateIndeterminate)

// Set initial indeterminate state
onMounted(updateIndeterminate)
</script>

<style scoped>
/* Inherits Bulma checkbox styles from global stylesheet */
.checkbox {
  /* Add slight padding for better vertical alignment */
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox input[type="checkbox"] {
  flex-shrink: 0;
}

.checkbox.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Enhanced checkbox styling with padding */
.checkbox input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid #dbdbdb;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease-in-out;
}

.checkbox input[type="checkbox"]:hover {
  border-color: #b5b5b5;
}

.checkbox input[type="checkbox"]:checked {
  border-color: #00d1b2;
  background-color: #00d1b2;
}

.checkbox input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -60%) rotate(45deg);
}

.checkbox input[type="checkbox"]:indeterminate {
  border-color: #00d1b2;
  background-color: #00d1b2;
}

.checkbox input[type="checkbox"]:indeterminate::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 2px;
  background-color: white;
  transform: translate(-50%, -50%);
}

/* Variant colors for checkbox */
.checkbox.is-primary input[type="checkbox"]:checked,
.checkbox.is-primary input[type="checkbox"]:indeterminate {
  border-color: #00d1b2;
  background-color: #00d1b2;
}

.checkbox.is-link input[type="checkbox"]:checked,
.checkbox.is-link input[type="checkbox"]:indeterminate {
  border-color: #485fc7;
  background-color: #485fc7;
}

.checkbox.is-info input[type="checkbox"]:checked,
.checkbox.is-info input[type="checkbox"]:indeterminate {
  border-color: #3e8ed0;
  background-color: #3e8ed0;
}

.checkbox.is-success input[type="checkbox"]:checked,
.checkbox.is-success input[type="checkbox"]:indeterminate {
  border-color: #48c78e;
  background-color: #48c78e;
}

.checkbox.is-warning input[type="checkbox"]:checked,
.checkbox.is-warning input[type="checkbox"]:indeterminate {
  border-color: #ffe08a;
  background-color: #ffe08a;
}

.checkbox.is-warning input[type="checkbox"]:checked::after,
.checkbox.is-warning input[type="checkbox"]:indeterminate::after {
  border-color: rgba(0, 0, 0, 0.7);
  background-color: rgba(0, 0, 0, 0.7);
}

.checkbox.is-danger input[type="checkbox"]:checked,
.checkbox.is-danger input[type="checkbox"]:indeterminate {
  border-color: #f14668;
  background-color: #f14668;
}

/* Size variants */
.checkbox.is-small {
  font-size: 0.75rem;
}

.checkbox.is-small input[type="checkbox"] {
  width: 0.875rem;
  height: 0.875rem;
}

.checkbox.is-medium {
  font-size: 1.25rem;
}

.checkbox.is-medium input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
}

.checkbox.is-large {
  font-size: 1.5rem;
}

.checkbox.is-large input[type="checkbox"] {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
