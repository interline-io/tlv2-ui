<template>
  <div class="card">
    <header v-if="label || $slots.header" class="card-header">
      <slot name="header">
        <p v-if="label" class="card-header-title">
          {{ label }}
        </p>
      </slot>
    </header>
    <div class="card-content">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * Card component - a flexible content container.
 * Based on Bulma Card component.
 *
 * @component t-card
 * @see https://bulma.io/documentation/components/card/
 */

interface Props {
  /**
   * Optional label/title for the card header.
   * If not provided and no #header slot is used, the header won't be rendered.
   */
  label?: string
}

defineProps<Props>()
</script>
