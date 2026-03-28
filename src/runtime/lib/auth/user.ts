// Re-export from the composable wrapper which delegates based on authMode
export { useUser } from '../../composables/useUser'
export type { TlUser } from '../../auth/shared/types'

// Re-export clearUser from both modes for direct imports
export { clearUser } from '../../auth/server/useUser'
