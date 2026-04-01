import { defineEventHandler } from 'h3'
// @ts-expect-error useAuth0 is added to #imports by @auth0/auth0-nuxt via addServerImportsDir
import { useAuth0 } from '#imports'

// Server middleware that extracts auth0 session and attaches it to event.context.
// Only registered when auth0 clientId is configured (see module.ts).
export default defineEventHandler(async (event) => {
  const auth0 = useAuth0(event)
  const session = await auth0.getSession()
  if (!session?.user) {
    return
  }
  const tokenSet = await auth0.getAccessToken()
  event.context.auth0Session = {
    user: session.user,
    accessToken: tokenSet.accessToken || ''
  }
})
