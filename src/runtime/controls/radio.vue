<template>
  <label class="radio" :class="radioClasses">
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
import { computed } from 'vue'

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
  /** Color variant for the radio button */
  variant?: 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger'
  /** Size of the radio button */
  size?: 'small' | 'normal' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  nativeValue: undefined,
  name: undefined,
  disabled: false,
  variant: undefined,
  size: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
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

<style scoped>
.radio {
  cursor: pointer;
}

.radio.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variant colors for radio using accent-color */
.radio.is-primary input[type="radio"]:checked {
  accent-color: #00d1b2;
}

.radio.is-link input[type="radio"]:checked {
  accent-color: #485fc7;
}

.radio.is-info input[type="radio"]:checked {
  accent-color: #3e8ed0;
}

.radio.is-success input[type="radio"]:checked {
  accent-color: #48c78e;
}

.radio.is-warning input[type="radio"]:checked {
  accent-color: #ffe08a;
}

.radio.is-danger input[type="radio"]:checked {
  accent-color: #f14668;
}

/* Size variants */
.radio.is-small {
  font-size: 0.75rem;
}

.radio.is-small input[type="radio"] {
  width: 0.875rem;
  height: 0.875rem;
}

.radio.is-medium {
  font-size: 1.25rem;
}

.radio.is-medium input[type="radio"] {
  width: 1.25rem;
  height: 1.25rem;
}

.radio.is-large {
  font-size: 1.5rem;
}

.radio.is-large input[type="radio"] {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
