import { useNuxtApp } from '#app'
import type { Toast } from '../components/toast-container.client.vue'

export const useToastNotification = () => {
  // Guard against SSR
  if (import.meta.server) {
    return {
      showToast: (message: string, variant?: Toast['variant']) => {
        console.warn('[useToastNotification] Attempted to show toast during SSR:', message, variant)
      }
    }
  }

  const nuxtApp = useNuxtApp()

  const showToast = (message: string, variant: Toast['variant'] = 'primary') => {
    try {
      const toastContainer = nuxtApp.vueApp?._instance?.appContext?.app?._context?.provides?.toastContainer

      if (!toastContainer) {
        console.warn('[useToastNotification] Toast container not available:', message)
        return
      }

      toastContainer.add(message, variant)
    } catch (error) {
      console.error('[useToastNotification] Error showing toast:', error)
    }
  }

  return {
    showToast
  }
}
