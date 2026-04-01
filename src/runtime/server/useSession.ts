import type { H3Event } from 'h3'

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
// This is the single entry point for all server-side auth.
//
// Reads from event.context.auth0Session, which is populated by the
// auth0 server middleware (only registered when clientId is configured).
// The access token is fetched lazily to avoid calling getAccessToken()
// on routes that don't need it (e.g., auth0-nuxt's /auth/* handlers).
export async function useAuth0Session (event: H3Event): Promise<SessionContext> {
  const session = event.context.auth0Session
  if (!session) {
    return anonymousSession()
  }
  return {
    loggedIn: true,
    user: session.user,
    accessToken: await session.getAccessToken()
  }
}
