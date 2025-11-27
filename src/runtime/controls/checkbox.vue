<template>
  <label class="checkbox" :class="{ 'is-disabled': disabled }">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    >
    <slot>{{ label }}</slot>
  </label>
</template>

<script setup lang="ts">
/**
 * Checkbox input component with v-model support.
 * Follows Bulma checkbox styling.
 *
 * @component t-checkbox
 * @example
 * <t-checkbox v-model="checked">Accept terms</t-checkbox>
 * <t-checkbox v-model="checked" disabled>Disabled option</t-checkbox>
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
   * Label text (alternative to using default slot).
   */
  label?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  label: undefined
})

/**
 * Emitted when checkbox state changes.
 * @event update:modelValue
 */
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function handleChange (event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
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
