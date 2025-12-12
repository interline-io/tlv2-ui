<template>
  <div class="t-slider-wrapper">
    <input
      ref="sliderRef"
      type="range"
      class="t-slider"
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
      class="t-slider-tooltip"
      :style="tooltipStyle"
    >
      {{ currentValue }}
    </div>
    <div v-if="hasTicks" class="t-slider-ticks">
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

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.t-slider-wrapper {
  position: relative;
  width: 100%;

  .t-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 0.5rem;
    border-radius: $radius-rounded;
    background: $grey-lighter;
    outline: none;
    margin: 1rem 0;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: $link;
      cursor: pointer;
      border: 1px solid $link;
    }

    &::-moz-range-thumb {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: $link;
      cursor: pointer;
      border: 1px solid $link;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;

      &::-webkit-slider-thumb {
        cursor: not-allowed;
      }

      &::-moz-range-thumb {
        cursor: not-allowed;
      }
    }

    // Size variants
    &.is-small {
      height: 0.375rem;

      &::-webkit-slider-thumb {
        width: 0.75rem;
        height: 0.75rem;
      }

      &::-moz-range-thumb {
        width: 0.75rem;
        height: 0.75rem;
      }
    }

    &.is-medium {
      height: 0.625rem;

      &::-webkit-slider-thumb {
        width: 1.25rem;
        height: 1.25rem;
      }

      &::-moz-range-thumb {
        width: 1.25rem;
        height: 1.25rem;
      }
    }

    &.is-large {
      height: 0.75rem;

      &::-webkit-slider-thumb {
        width: 1.5rem;
        height: 1.5rem;
      }

      &::-moz-range-thumb {
        width: 1.5rem;
        height: 1.5rem;
      }
    }

    // Color variants
    @each $name, $color in (
      "primary": $primary,
      "link": $link,
      "info": $info,
      "success": $success,
      "warning": $warning,
      "danger": $danger
    ) {
      &.is-#{$name} {
        &::-webkit-slider-thumb {
          background: $color;
          border-color: $color;
        }

        &::-moz-range-thumb {
          background: $color;
          border-color: $color;
        }
      }
    }
  }

  .t-slider-ticks {
    display: flex;
    justify-content: space-between;
    margin-top: -0.5rem;
    font-size: $size-small;
    color: $grey;
  }

  .t-slider-tooltip {
    position: absolute;
    top: -2.5rem;
    transform: translateX(-50%);
    background: $grey-darker;
    color: $white;
    padding: 0.25rem 0.5rem;
    border-radius: $radius;
    font-size: $size-small;
    white-space: nowrap;
    pointer-events: none;
    z-index: 10;

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 0.25rem solid transparent;
      border-top-color: $grey-darker;
    }
  }
}
</style>
