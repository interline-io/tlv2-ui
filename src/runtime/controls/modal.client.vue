<template>
  <Teleport to="body">
    <div class="modal t-modal" :class="{ 'is-active': modelValue }">
      <div class="modal-background" @click="handleBackgroundClick" />
      <div class="modal-card" :class="modalCardClasses">
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
        <footer v-if="$slots.footer" class="modal-card-foot">
          <slot name="footer" :close="close" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onBeforeUnmount } from 'vue'

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

  /**
   * Modal size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  closable: true,
  fullScreen: false,
  size: 'medium'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const modalCardClasses = computed(() => ({
  't-modal-fullscreen': props.fullScreen,
  't-modal-small': props.size === 'small',
  't-modal-medium': props.size === 'medium',
  't-modal-large': props.size === 'large'
}))

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
  width: 800px;
  max-width: 90vw;
}
.t-modal .modal-card.t-modal-small {
  width: 480px;
}
.t-modal .modal-card.t-modal-medium {
  width: 800px;
}
.t-modal .modal-card.t-modal-large {
  width: 1200px;
}
.t-modal .modal-card.t-modal-fullscreen {
  width: calc(100vw - 40px);
  height: calc(100vh - 40px);
  max-height: calc(100vh - 40px);
  margin: 20px;
}
.t-modal .modal-card-foot {
  justify-content: flex-end;
}
</style>
