<template>
  <div v-if="active" class="t-loading" :class="{ 'is-full-page': fullPage }">
    <div class="t-loading-background" :class="{ 'is-full-page': fullPage }" @click="handleCancel" />
    <div class="t-loading-icon">
      <div class="loader" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Loading overlay component with spinner.
 * Shows a loading indicator over content or full page.
 *
 * @component t-loading
 * @example
 * <t-loading :active="isLoading" />
 * <t-loading :active="isLoading" full-page />
 */

interface Props {
  /**
   * Show/hide the loading overlay.
   * @default false
   */
  active?: boolean

  /**
   * Cover the entire page instead of just the parent container.
   * @default false
   */
  fullPage?: boolean

  /**
   * Allow clicking overlay to cancel loading.
   * @default false
   */
  canCancel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  fullPage: false,
  canCancel: false
})

/**
 * Emitted when overlay is clicked and canCancel is true.
 * @event cancel
 */
const emit = defineEmits<{
  cancel: []
}>()

function handleCancel () {
  if (props.canCancel) {
    emit('cancel')
  }
}
</script>

<style scoped>
.t-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 29;
}

.t-loading.is-full-page {
  position: fixed;
  z-index: 999;
}

.t-loading-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
}

.t-loading-background.is-full-page {
  background: rgba(255, 255, 255, 0.9);
}

.t-loading-icon {
  position: relative;
  z-index: 1;
}

/* Bulma loader styles */
.loader {
  animation: spinAround 500ms infinite linear;
  border: 2px solid #dbdbdb;
  border-radius: 9999px;
  border-right-color: transparent;
  border-top-color: transparent;
  content: "";
  display: block;
  height: 3rem;
  width: 3rem;
  position: relative;
}

@keyframes spinAround {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}
</style>
