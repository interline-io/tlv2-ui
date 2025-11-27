<template>
  <label class="checkbox" :class="{ 'is-disabled': disabled }">
    <input
      ref="inputRef"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    >
    <slot>{{ label }}</slot>
  </label>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

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
   */
  modelValue?: boolean

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
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  indeterminate: false,
  label: undefined
})

/**
 * Emitted when checkbox state changes.
 * @event update:modelValue
 */
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function handleChange (event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
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
</style>
