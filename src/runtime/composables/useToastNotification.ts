import { useNuxtApp } from '#app'

export const useToastNotification = () => {
  // Guard against SSR - get nuxtApp at composable initialization
  if (import.meta.server) {
    return {
      showToast: (message: string) => {
        console.warn('[useToastNotification] Attempted to show toast during SSR:', message)
      }
    }
  }

  // Get nuxtApp once at the top level of the composable
  const nuxtApp = useNuxtApp()

  const showToast = (message: string) => {
    try {
      const oruga = nuxtApp.vueApp?.config?.globalProperties?.$oruga

      if (!oruga?.notification?.open) {
        console.warn('[useToastNotification] Oruga notification not available:', message)
        return
      }

      oruga.notification.open({
        message,
        rootClass: 'toast toast-notification',
        position: 'bottom',
        variant: 'primary'
      })
    } catch (error) {
      console.error('[useToastNotification] Error showing toast:', error)
    }
  }

  return {
    showToast
  }
}
