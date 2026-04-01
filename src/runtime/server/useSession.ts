import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'

export interface SessionContext {
  loggedIn: boolean
  user: Record<string, any> | null
  accessToken: string
}

function anonymousSession (): SessionContext {
  return { loggedIn: false, user: null, accessToken: '' }
}

// Returns the current user's session and access token.
// loggedIn is false when auth0 is not configured or the user is anonymous.
// This is the single entry point for all server-side auth — no other
// code should call useAuth0/getSession/getAccessToken directly.
//
// useAuth0 is dynamically imported because auth0-nuxt is only installed
// when clientId is configured — a static import would fail at build time.
export async function useAuth0Session (event: H3Event): Promise<SessionContext> {
  const config = useRuntimeConfig(event)
  if (!config.auth0?.clientId) {
    return anonymousSession()
  }
  // @ts-expect-error useAuth0 is added to #imports by @auth0/auth0-nuxt
  const { useAuth0 } = await import('#imports')
  const auth0 = useAuth0(event)
  const session = await auth0.getSession()
  if (!session?.user) {
    return anonymousSession()
  }
  const tokenSet = await auth0.getAccessToken()
  return {
    loggedIn: true,
    user: session.user,
    accessToken: tokenSet.accessToken || ''
  }
}
