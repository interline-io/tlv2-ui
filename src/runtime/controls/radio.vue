<template>
  <label class="radio" :class="{ 'is-disabled': disabled }">
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

<script setup lang="ts">
/**
 * Radio button component using native HTML radio input with Bulma styling.
 *
 * @example
 * ```vue
 * <t-radio v-model="selected" native-value="option1" name="choice">Option 1</t-radio>
 * <t-radio v-model="selected" native-value="option2" name="choice">Option 2</t-radio>
 * ```
 */

interface Props<T = string | number | boolean | null> {
  /** The v-model value - should match nativeValue when this radio is selected */
  modelValue?: T
  /** The value this radio represents - what gets emitted when selected */
  nativeValue?: T
  /** The name attribute for the radio group - all radios in a group should have the same name */
  name?: string
  /** Whether the radio button is disabled */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  nativeValue: undefined,
  name: undefined,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

function handleChange () {
  if (!props.disabled && props.nativeValue !== undefined) {
    emit('update:modelValue', props.nativeValue)
  }
}
</script>

<style scoped>
.radio.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
