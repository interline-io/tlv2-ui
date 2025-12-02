<template>
  <span class="t-tooltip" :class="`is-tooltip-${position}`" v-bind="{ 'data-tooltip': text }">
    <slot />
  </span>
</template>

<script setup lang="ts">
/**
 * Pure CSS tooltip component.
 * Displays tooltip text on hover using CSS pseudo-elements.
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

withDefaults(defineProps<Props>(), {
  position: 'top'
})
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
