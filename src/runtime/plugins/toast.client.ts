import { defineNuxtPlugin } from '#app'
import { ref, h, render } from 'vue'
import ToastContainer from '../components/toast-container.client.vue'

export default defineNuxtPlugin((nuxtApp) => {
  // Create a container element
  const containerEl = document.createElement('div')
  containerEl.id = 'toast-container-root'
  document.body.appendChild(containerEl)

  // Create a ref to hold the toast container instance
  const toastContainerRef = ref<InstanceType<typeof ToastContainer> | null>(null)

  // Render the toast container
  const vnode = h(ToastContainer, {
    ref: toastContainerRef
  })

  render(vnode, containerEl)

  // Wait for the component to mount and then provide it
  nuxtApp.hook('app:mounted', () => {
    if (toastContainerRef.value) {
      nuxtApp.vueApp.provide('toastContainer', toastContainerRef.value)
    }
  })
})
