import { defineEventHandler } from 'h3'

// Server middleware to protect API routes
// Auth0-nuxt handles login/callback/logout routes and populates the session.
// This middleware ensures /api/v2/** routes have a valid session.
export default defineEventHandler(async (event) => {
  const url = event.path || ''

  // Only protect proxy API routes
  if (!url.startsWith('/api/v2')) {
    return
  }

  // useAuth0 is auto-imported by Nitro from @auth0/auth0-nuxt
  // @ts-expect-error — type available at runtime via Nitro auto-imports
  const auth0 = useAuth0(event)
  try {
    const session = await auth0.getSession()
    if (!session) {
      throw new Error('No session')
    }
  } catch {
    event.node.res.statusCode = 401
    event.node.res.end(JSON.stringify({ error: 'Unauthorized' }))
  }
})
