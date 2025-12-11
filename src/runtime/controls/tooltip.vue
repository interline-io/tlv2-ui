<template>
  <span
    ref="tooltipRef"
    class="t-tooltip"
    :class="`is-tooltip-${effectivePosition}`"
    v-bind="{ 'data-tooltip': text }"
    @mouseenter="adjustPosition"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

/**
 * Pure CSS tooltip component with smart positioning.
 * Displays tooltip text on hover and automatically adjusts position to stay within viewport.
 *
 * @component t-tooltip
 * @example
 * <t-tooltip text="Click to save">
 *   <button class="button">Save</button>
 * </t-tooltip>
 */

interface Props {
  /**
   * Tooltip text content.
   */
  text: string

  /**
   * Tooltip position relative to element.
   * @default 'top'
   */
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top'
})

const tooltipRef = ref<HTMLElement | null>(null)
const adjustedPosition = ref<string | null>(null)

const effectivePosition = computed(() => {
  return adjustedPosition.value || props.position
})

function adjustPosition () {
  if (!tooltipRef.value) return

  // Reset to original position first
  adjustedPosition.value = null

  // Wait for next frame to get proper dimensions
  requestAnimationFrame(() => {
    if (!tooltipRef.value) return

    const rect = tooltipRef.value.getBoundingClientRect()
    const tooltipWidth = 300 // max-width of tooltip
    const tooltipHeight = 100 // estimated max height
    const margin = 20 // safety margin

    let newPosition = props.position

    // Check horizontal clipping
    if (props.position === 'top' || props.position === 'bottom') {
      const tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2
      const tooltipRight = rect.left + rect.width / 2 + tooltipWidth / 2

      if (tooltipLeft < margin) {
        // Would clip on left, try right position
        if (rect.right + tooltipWidth + margin < window.innerWidth) {
          newPosition = 'right'
        } else if (props.position === 'top') {
          newPosition = 'bottom'
        } else {
          newPosition = 'top'
        }
      } else if (tooltipRight > window.innerWidth - margin) {
        // Would clip on right, try left position
        if (rect.left - tooltipWidth - margin > 0) {
          newPosition = 'left'
        } else if (props.position === 'top') {
          newPosition = 'bottom'
        } else {
          newPosition = 'top'
        }
      }
    }

    // Check vertical clipping
    if (props.position === 'top') {
      if (rect.top - tooltipHeight < margin) {
        newPosition = 'bottom'
      }
    } else if (props.position === 'bottom') {
      if (rect.bottom + tooltipHeight > window.innerHeight - margin) {
        newPosition = 'top'
      }
    }

    // Check left/right positions
    if (props.position === 'left') {
      if (rect.left - tooltipWidth < margin) {
        newPosition = 'right'
      }
    } else if (props.position === 'right') {
      if (rect.right + tooltipWidth > window.innerWidth - margin) {
        newPosition = 'left'
      }
    }

    if (newPosition !== props.position) {
      adjustedPosition.value = newPosition
    }
  })
}
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

$tooltip-bg: rgba($black, 0.9);
$tooltip-arrow-size: 6px;
$tooltip-arrow-offset: 2px;
$tooltip-offset: 8px;

.t-tooltip {
  position: relative;
  display: inline-block;

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    padding: 8px 12px;
    background: $tooltip-bg;
    color: $white;
    border-radius: $radius;
    font-size: $size-small;
    line-height: 1.4;
    white-space: normal;
    width: max-content;
    max-width: 300px;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
    z-index: 1000;
  }

  &::before {
    content: '';
    position: absolute;
    border: $tooltip-arrow-size solid transparent;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
    z-index: 1000;
  }

  &:hover {
    &::after,
    &::before {
      opacity: 1;
      visibility: visible;
    }
  }

  // Top position (default)
  &.is-tooltip-top {
    &::after {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: $tooltip-offset;
    }

    &::before {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: $tooltip-arrow-offset;
      border-top-color: $tooltip-bg;
    }
  }

  // Bottom position
  &.is-tooltip-bottom {
    &::after {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: $tooltip-offset;
    }

    &::before {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: $tooltip-arrow-offset;
      border-bottom-color: $tooltip-bg;
    }
  }

  // Left position
  &.is-tooltip-left {
    &::after {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: $tooltip-offset;
    }

    &::before {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: $tooltip-arrow-offset;
      border-left-color: $tooltip-bg;
    }
  }

  // Right position
  &.is-tooltip-right {
    &::after {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: $tooltip-offset;
    }

    &::before {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: $tooltip-arrow-offset;
      border-right-color: $tooltip-bg;
    }
  }
}
</style>
