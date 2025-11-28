<template>
  <div class="slider-wrapper">
    <input
      ref="sliderRef"
      type="range"
      class="slider"
      :class="sliderClasses"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      v-bind="$attrs"
      @input="handleInput"
    >
    <div v-if="hasTicks" class="slider-ticks">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, provide } from 'vue'

interface Props {
  /**
   * The v-model value of the slider.
   */
  modelValue?: number | null

  /**
   * Minimum value.
   * @default 0
   */
  min?: number

  /**
   * Maximum value.
   * @default 100
   */
  max?: number

  /**
   * Step increment.
   * @default 1
   */
  step?: number

  /**
   * The size of the slider.
   * @values small, normal, medium, large
   */
  size?: 'small' | 'normal' | 'medium' | 'large'

  /**
   * Whether the slider is disabled.
   * @default false
   */
  disabled?: boolean

  /**
   * Whether to show a tooltip with the current value.
   * @default false
   */
  tooltip?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  min: 0,
  max: 100,
  step: 1,
  size: undefined,
  disabled: false,
  tooltip: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const slots = useSlots()
const sliderRef = ref<HTMLInputElement>()

const hasTicks = computed(() => !!slots.default)

const sliderClasses = computed(() => {
  const classes: string[] = []

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  return classes
})

function handleInput (event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value === '' ? null : Number.parseFloat(target.value)
  emit('update:modelValue', value)
}

function setValue (value: number) {
  if (!props.disabled) {
    emit('update:modelValue', value)
  }
}

provide('sliderSetValue', setValue)
</script>

<style scoped>
.slider-wrapper {
  position: relative;
  width: 100%;
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 0.5rem;
  border-radius: 290486px;
  background: #dbdbdb;
  outline: none;
  margin: 1rem 0;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #485fc7;
  cursor: pointer;
  border: 1px solid #485fc7;
}

.slider::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #485fc7;
  cursor: pointer;
  border: 1px solid #485fc7;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

.slider:disabled::-moz-range-thumb {
  cursor: not-allowed;
}

.slider.is-small {
  height: 0.375rem;
}

.slider.is-small::-webkit-slider-thumb {
  width: 0.75rem;
  height: 0.75rem;
}

.slider.is-small::-moz-range-thumb {
  width: 0.75rem;
  height: 0.75rem;
}

.slider.is-medium {
  height: 0.625rem;
}

.slider.is-medium::-webkit-slider-thumb {
  width: 1.25rem;
  height: 1.25rem;
}

.slider.is-medium::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
}

.slider.is-large {
  height: 0.75rem;
}

.slider.is-large::-webkit-slider-thumb {
  width: 1.5rem;
  height: 1.5rem;
}

.slider.is-large::-moz-range-thumb {
  width: 1.5rem;
  height: 1.5rem;
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  margin-top: -0.5rem;
  font-size: 0.75rem;
  color: #7a7a7a;
}
</style>
