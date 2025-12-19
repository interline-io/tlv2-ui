<template>
  <label class="checkbox t-checkbox" :class="checkboxClasses">
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

<style lang="scss" scoped>
/* Uses Bulma CSS custom properties to respect theme configuration */
.t-checkbox {
  /* Add slight padding for better vertical alignment */
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  input[type="checkbox"] {
    flex-shrink: 0;
    appearance: none;
    -webkit-appearance: none;
    width: 1.125rem;
    height: 1.125rem;
    border: 2px solid var(--bulma-grey-light);
    border-radius: var(--bulma-radius);
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease-in-out;

    &:hover {
      border-color: var(--bulma-grey);
    }

    &:checked {
      border-color: var(--bulma-primary);
      background-color: var(--bulma-primary);

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 4px;
        height: 8px;
        border: solid var(--bulma-white);
        border-width: 0 2px 2px 0;
        transform: translate(-50%, -60%) rotate(45deg);
      }
    }

    &:indeterminate {
      border-color: var(--bulma-primary);
      background-color: var(--bulma-primary);

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 8px;
        height: 2px;
        background-color: var(--bulma-white);
        transform: translate(-50%, -50%);
      }
    }
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Variant colors for checkbox */
  @each $name, $var in (
    "primary": "--bulma-primary",
    "link": "--bulma-link",
    "info": "--bulma-info",
    "success": "--bulma-success",
    "danger": "--bulma-danger"
  ) {
    &.is-#{$name} input[type="checkbox"]:checked,
    &.is-#{$name} input[type="checkbox"]:indeterminate {
      border-color: var(#{$var});
      background-color: var(#{$var});
    }
  }

  /* Warning variant needs dark checkmark for contrast */
  &.is-warning input[type="checkbox"]:checked,
  &.is-warning input[type="checkbox"]:indeterminate {
    border-color: var(--bulma-warning);
    background-color: var(--bulma-warning);

    &::after {
      border-color: rgba(0, 0, 0, 0.7);
      background-color: rgba(0, 0, 0, 0.7);
    }
  }

  /* Size variants */
  @each $name, $var, $box-size in (
    ("small", "--bulma-size-small", 0.875rem),
    ("medium", "--bulma-size-medium", 1.25rem),
    ("large", "--bulma-size-large", 1.5rem)
  ) {
    &.is-#{$name} {
      font-size: var(#{$var});

      input[type="checkbox"] {
        width: $box-size;
        height: $box-size;
      }
    }
  }
}
</style>
