import { useNuxtApp } from '#app'

export const useToastNotification = () => {
  const showToast = (message: string) => {
    const nuxtApp = useNuxtApp()
    nuxtApp.vueApp.config.globalProperties.$oruga.notification.open({
      message,
      rootClass: 'toast toast-notification',
      position: 'bottom',
      variant: 'primary'
    })
  }

  return {
    showToast
  }
} 