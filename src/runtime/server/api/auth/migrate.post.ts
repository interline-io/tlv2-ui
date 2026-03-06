import { defineEventHandler, readBody, createError } from 'h3'
import { getAuth0Config, verifyToken, setAuthCookie, extractToken } from '../../utils/auth'

/**
 * Migration endpoint: accepts an existing JWT (from Auth0 SPA SDK localStorage)
 * and sets it as an HttpOnly cookie for server-side auth.
 *
 * POST /api/auth/migrate
 * Body: { token: string }
 *
 * Only processes the request if no auth cookie is already set.
 */
export default defineEventHandler(async (event) => {
  const auth0 = getAuth0Config()
  if (!auth0) {
    throw createError({ statusCode: 500, statusMessage: 'Auth not configured' })
  }

  // Skip if user already has a valid auth cookie
  const existingToken = extractToken(event)
  if (existingToken) {
    return { migrated: false, reason: 'already_authenticated' }
  }

  const body = await readBody(event)
  const token = body?.token as string | undefined
  if (!token || typeof token !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing token' })
  }

  // Verify the token is valid before setting as cookie
  try {
    await verifyToken(token, auth0)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  // Set as HttpOnly cookie — use a conservative maxAge since we don't know
  // the original expiry. The token's own `exp` claim will still be enforced
  // on subsequent verification.
  setAuthCookie(event, token, 86400)

  return { migrated: true }
})
