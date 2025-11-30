<template>
  <div class="slider-wrapper">
    <input
      ref="sliderRef"
      type="range"
      class="slider"
      :class="sliderClasses"
      :value="currentValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      v-bind="$attrs"
      @input="handleInput"
      @mousedown="showTooltip = true"
      @mouseup="showTooltip = false"
      @touchstart="showTooltip = true"
      @touchend="showTooltip = false"
    >
    <div
      v-if="tooltip && showTooltip"
      class="slider-tooltip"
      :style="tooltipStyle"
    >
      {{ currentValue }}
    </div>
    <div v-if="hasTicks" class="slider-ticks">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, provide } from 'vue'
import type { SliderSize, SliderVariant } from './types'

interface Props {
  /**
   * The v-model value of the slider.
   */
  modelValue?: number

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
  size?: SliderSize

  /**
   * The color variant of the slider.
   * @values primary, link, info, success, warning, danger
   */
  variant?: SliderVariant

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
  modelValue: undefined,
  min: 0,
  max: 100,
  step: 1,
  size: undefined,
  variant: undefined,
  disabled: false,
  tooltip: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const slots = useSlots()
const sliderRef = ref<HTMLInputElement>()
const showTooltip = ref(false)

// Compute the actual value, defaulting to midpoint if undefined
const currentValue = computed(() => {
  return props.modelValue ?? ((props.max + props.min) / 2)
})

const hasTicks = computed(() => !!slots.default)

const tooltipStyle = computed(() => {
  const percentage = ((currentValue.value - props.min) / (props.max - props.min)) * 100
  return {
    left: `${percentage}%`
  }
})

const sliderClasses = computed(() => {
  const classes: string[] = []

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  return classes
})

function handleInput (event: Event) {
  const target = event.target as HTMLInputElement
  const value = Number.parseFloat(target.value)
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

/* Variants */
.slider.is-primary::-webkit-slider-thumb {
  background: #00d1b2;
  border-color: #00d1b2;
}

.slider.is-primary::-moz-range-thumb {
  background: #00d1b2;
  border-color: #00d1b2;
}

.slider.is-link::-webkit-slider-thumb {
  background: #485fc7;
  border-color: #485fc7;
}

.slider.is-link::-moz-range-thumb {
  background: #485fc7;
  border-color: #485fc7;
}

.slider.is-info::-webkit-slider-thumb {
  background: #3e8ed0;
  border-color: #3e8ed0;
}

.slider.is-info::-moz-range-thumb {
  background: #3e8ed0;
  border-color: #3e8ed0;
}

.slider.is-success::-webkit-slider-thumb {
  background: #48c78e;
  border-color: #48c78e;
}

.slider.is-success::-moz-range-thumb {
  background: #48c78e;
  border-color: #48c78e;
}

.slider.is-warning::-webkit-slider-thumb {
  background: #ffe08a;
  border-color: #ffe08a;
}

.slider.is-warning::-moz-range-thumb {
  background: #ffe08a;
  border-color: #ffe08a;
}

.slider.is-danger::-webkit-slider-thumb {
  background: #f14668;
  border-color: #f14668;
}

.slider.is-danger::-moz-range-thumb {
  background: #f14668;
  border-color: #f14668;
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  margin-top: -0.5rem;
  font-size: 0.75rem;
  color: #7a7a7a;
}

.slider-tooltip {
  position: absolute;
  top: -2.5rem;
  transform: translateX(-50%);
  background: #363636;
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
}

.slider-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 0.25rem solid transparent;
  border-top-color: #363636;
}
</style>
