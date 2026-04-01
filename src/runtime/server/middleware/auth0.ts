import { defineEventHandler } from 'h3'
// @ts-expect-error useAuth0 is added to #imports by @auth0/auth0-nuxt via addServerImportsDir
import { useAuth0 } from '#imports'

// Server middleware that extracts auth0 session and attaches it to event.context.
// Only registered when auth0 clientId is configured (see module.ts).
// Provides a lazy getAccessToken so the token is only fetched when a handler needs it,
// avoiding interference with auth0-nuxt's own /auth/* routes.
export default defineEventHandler(async (event) => {
  const auth0 = useAuth0(event)
  const session = await auth0.getSession()
  if (!session?.user) {
    return
  }
  event.context.auth0Session = {
    user: session.user,
    getAccessToken: () => auth0.getAccessToken().then((t: any) => t.accessToken || '')
  }
})
