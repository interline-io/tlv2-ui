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

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'

/**
 * Checkbox input component with v-model support.
 * Follows Bulma checkbox styling with indeterminate state support.
 *
 * @component t-checkbox
 * @example
 * <t-checkbox v-model="checked">Accept terms</t-checkbox>
 * <t-checkbox v-model="checked" disabled>Disabled option</t-checkbox>
 * <t-checkbox v-model="checked" :indeterminate="someChildrenChecked">Select all</t-checkbox>
 */

interface Props {
  /**
   * Checkbox checked state (v-model).
   * Can be a boolean for single checkboxes or an array for checkbox groups.
   */
  modelValue?: boolean | any[]

  /**
   * Value to add/remove from array when used with array binding.
   */
  nativeValue?: any

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
  variant?: 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger'

  /**
   * Size of the checkbox.
   */
  size?: 'small' | 'normal' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
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
  'update:modelValue': [value: boolean | any[]]
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
    emit('update:modelValue', newValue)
  } else {
    // Boolean binding mode
    emit('update:modelValue', target.checked)
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
}

.checkbox.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variant colors for checkbox using accent-color */
.checkbox.is-primary input[type="checkbox"]:checked {
  accent-color: #00d1b2;
}

.checkbox.is-link input[type="checkbox"]:checked {
  accent-color: #485fc7;
}

.checkbox.is-info input[type="checkbox"]:checked {
  accent-color: #3e8ed0;
}

.checkbox.is-success input[type="checkbox"]:checked {
  accent-color: #48c78e;
}

.checkbox.is-warning input[type="checkbox"]:checked {
  accent-color: #ffe08a;
}

.checkbox.is-danger input[type="checkbox"]:checked {
  accent-color: #f14668;
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
