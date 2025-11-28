<template>
  <div>
    <h2 class="title is-3 m-0 mt-5 mb-3">
      {{ label }}
    </h2>
    <div class="box" :class="{ 'demo-example': example }">
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
  border-left: 3px solid hsl(171, 100%, 41%);
}
</style>
