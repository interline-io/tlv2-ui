export type ToastVariant = 'primary' | 'info' | 'success' | 'warning' | 'danger'

export const useToastNotification = () => {
  // Guard against SSR
  if (import.meta.server) {
    return {
      showToast: (message: string, variant?: ToastVariant) => {
        console.warn('[useToastNotification] Attempted to show toast during SSR:', message, variant)
      }
    }
  }

  const showToast = (message: string, variant: ToastVariant = 'primary', duration: number = 3000) => {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'toast-container'
      container.style.cssText = `
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
      `
      document.body.appendChild(container)
    }

    // Create toast element
    const toast = document.createElement('div')
    toast.className = `notification toast is-${variant}`
    toast.style.cssText = `
      pointer-events: auto;
      min-width: 250px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
    `
    toast.textContent = message

    container.appendChild(toast)

    // Trigger animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1'
      toast.style.transform = 'translateY(0)'
    })

    // Remove after duration
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateY(-20px)'
      setTimeout(() => {
        toast.remove()
        // Remove container if empty
        if (container && container.children.length === 0) {
          container.remove()
        }
      }, 300)
    }, duration)
  }

  return {
    showToast
  }
}
