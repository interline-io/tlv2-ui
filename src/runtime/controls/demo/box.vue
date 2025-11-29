<template>
  <div class="card">
    <header class="card-header" :class="{ 'demo-example': example }">
      <p class="card-header-title">
        {{ label }}
      </p>
    </header>
    <div class="card-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Demo box component for playground/documentation pages.
 * This component is only used for demonstration purposes and is not documented.
 *
 * @component t-demo-box
 * @internal
 */

interface Props {
  /**
   * The section label/title.
   */
  label: string
  /**
   * Whether this is a fully baked example (not just a single-feature demo).
   * When true, adds 'demo-example' class for visual distinction.
   */
  example?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.demo-example {
background:#eee;
}
</style>
