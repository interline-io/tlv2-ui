<template>
  <div class="modal t-modal" :class="{ 'is-active': modelValue }">
    <div class="modal-background" @click="handleBackgroundClick" />
    <div class="modal-card" :class="{ 't-modal-fullscreen': fullScreen }">
      <header class="modal-card-head">
        <p class="modal-card-title">
          {{ title }}
        </p>
        <button
          v-if="closable"
          type="button"
          class="delete"
          aria-label="close"
          @click="close"
        />
      </header>
      <section class="modal-card-body">
        <div v-if="modelValue" class="container">
          <slot :close="close" />
          <br>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount } from 'vue'

/**
 * Modal component using Bulma modal-card structure.
 * Wrapper around native Bulma modal with v-model support.
 *
 * @component t-modal
 * @example
 * <t-modal v-model="showModal" title="Edit Item">
 *   <p>Modal content</p>
 * </t-modal>
 */

interface Props {
  /**
   * Modal visibility state (v-model).
   */
  modelValue?: boolean

  /**
   * Modal title displayed in header.
   */
  title?: string

  /**
   * Show close button and allow closing via background/ESC.
   * @default true
   */
  closable?: boolean

  /**
   * Apply fullscreen mode with padding.
   * @default false
   */
  fullScreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  closable: true,
  fullScreen: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close (): void {
  emit('update:modelValue', false)
}

function handleBackgroundClick (): void {
  if (props.closable) {
    close()
  }
}

function handleKeydown (event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.closable && props.modelValue) {
    close()
  }
}

// Add/remove html clipping when modal opens/closes
watch(() => props.modelValue, (isActive) => {
  if (typeof document !== 'undefined') {
    if (isActive) {
      document.documentElement.classList.add('is-clipped')
    } else {
      document.documentElement.classList.remove('is-clipped')
    }
  }
})

// Setup ESC key handler
onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeydown)
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeydown)
    document.documentElement.classList.remove('is-clipped')
  }
})
</script>

<style>
.t-modal .modal-card {
  min-width: 800px;
}
.t-modal-fullscreen {
  padding-top: 30px;
  padding-bottom: 30px;
}
</style>
