<template>
  <div class="card t-demo-box">
    <header class="card-header t-demo-header" :class="{ 't-demo-example': example }">
      <p class="card-header-title">
        {{ label }}
      </p>
    </header>
    <div class="card-content t-demo-content">
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
   * When true, adds 't-demo-example' class for visual distinction.
   */

  example?: boolean
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.t-demo-example {
    background-color: var(--bulma-info);
}
</style>
