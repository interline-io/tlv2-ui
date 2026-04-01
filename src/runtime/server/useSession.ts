import type { H3Event } from 'h3'
// @ts-expect-error useAuth0 is added to #imports by @auth0/auth0-nuxt via addServerImportsDir
import { useAuth0, useRuntimeConfig } from '#imports'

export interface SessionContext {
  loggedIn: boolean
  user: Record<string, any> | null
  accessToken: string
}

const anonymous: SessionContext = { loggedIn: false, user: null, accessToken: '' }

// Returns the current user's session and access token.
// loggedIn is false when auth0 is not configured or the user is anonymous.
// This is the single entry point for all server-side auth — no other
// code should call useAuth0/getSession/getAccessToken directly.
export async function useAuth0Session (event: H3Event): Promise<SessionContext> {
  const config = useRuntimeConfig(event)
  if (!config.auth0?.clientId) {
    return anonymous
  }
  const auth0 = useAuth0(event)
  const session = await auth0.getSession()
  if (!session?.user) {
    return anonymous
  }
  const tokenSet = await auth0.getAccessToken()
  return {
    loggedIn: true,
    user: session.user,
    accessToken: tokenSet.accessToken || ''
  }
}
