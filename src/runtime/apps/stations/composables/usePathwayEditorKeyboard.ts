import { onMounted, onUnmounted } from 'vue'

interface KeyboardActions {
  onEscape: () => void
  onV: () => void
  onE: () => void
  onN: () => void
  onF: () => void
  onS: () => void
  onP: () => void
  onC: () => void
}

export function usePathwayEditorKeyboard (actions: KeyboardActions) {
  function handleKeyDown (event: KeyboardEvent) {
    const tag = ((event.target as HTMLElement)?.tagName || '').toLowerCase()
    if (['input', 'textarea', 'select'].includes(tag) || (event.target as HTMLElement)?.isContentEditable) {
      return
    }
    switch (event.key) {
      case 'Escape':
        actions.onEscape()
        break
      case 'v':
      case 'V':
        actions.onV()
        break
      case 'e':
      case 'E':
        actions.onE()
        break
      case 'n':
      case 'N':
        actions.onN()
        break
      case 'f':
      case 'F':
        actions.onF()
        break
      case 's':
      case 'S':
        actions.onS()
        break
      case 'p':
      case 'P':
        actions.onP()
        break
      case 'c':
      case 'C':
        actions.onC()
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
