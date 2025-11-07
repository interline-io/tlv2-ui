import { useNuxtApp } from '#app'

export const useToastNotification = () => {
  const showToast = (message: string) => {
    // Guard against SSR - notifications only work on client side
    if (import.meta.server) {
      console.warn('[useToastNotification] Attempted to show toast during SSR:', message)
      return
    }

    try {
      const nuxtApp = useNuxtApp()
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
