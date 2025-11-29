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

<style scoped>
.t-tooltip {
  position: relative;
  display: inline-block;
}

.t-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
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

.t-tooltip::before {
  content: '';
  position: absolute;
  border: 6px solid transparent;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 1000;
}

.t-tooltip:hover::after,
.t-tooltip:hover::before {
  opacity: 1;
  visibility: visible;
}

/* Top position (default) */
.t-tooltip.is-tooltip-top::after {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

.t-tooltip.is-tooltip-top::before {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 2px;
  border-top-color: rgba(0, 0, 0, 0.9);
}

/* Bottom position */
.t-tooltip.is-tooltip-bottom::after {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
}

.t-tooltip.is-tooltip-bottom::before {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 2px;
  border-bottom-color: rgba(0, 0, 0, 0.9);
}

/* Left position */
.t-tooltip.is-tooltip-left::after {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 8px;
}

.t-tooltip.is-tooltip-left::before {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 2px;
  border-left-color: rgba(0, 0, 0, 0.9);
}

/* Right position */
.t-tooltip.is-tooltip-right::after {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
}

.t-tooltip.is-tooltip-right::before {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 2px;
  border-right-color: rgba(0, 0, 0, 0.9);
}
</style>
