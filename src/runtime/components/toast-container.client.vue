<template>
  <teleport to="body">
    <div class="toast-container">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="notification toast"
          :class="`is-${toast.variant}`"
        >
          {{ toast.message }}
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger'
  duration: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

function add (message: string, variant: Toast['variant'] = 'primary', duration: number = 3000) {
  const id = nextId++
  const toast: Toast = { id, message, variant, duration }

  toasts.value.push(toast)

  setTimeout(() => {
    remove(id)
  }, duration)
}

function remove (id: number) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

defineExpose({
  add
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
  width: auto;
  max-width: 90vw;
}

.toast {
  pointer-events: auto;
  min-width: 250px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Toast transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
