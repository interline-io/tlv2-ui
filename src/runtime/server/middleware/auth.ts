import { defineEventHandler, createError, getRequestURL } from 'h3'
import {
  getAuth0Config,
  extractToken,
  verifyToken,
  isApiRequest,
  matchesAuthRoute,
  initiateLogin,
} from '../utils/auth'

export default defineEventHandler(async (event) => {
  const auth0 = getAuth0Config()
  if (!auth0) {
    return
  }

  // Skip auth routes
  const path = getRequestURL(event).pathname
  if (path.startsWith('/api/auth/')) {
    return
  }

  const token = extractToken(event)

  // If a token is present, always try to verify and populate event.context.auth
  if (token) {
    try {
      const payload = await verifyToken(token, auth0)
      event.context.auth = {
        sub: payload.sub,
        email: payload.email as string | undefined,
        permissions: payload.permissions as string[] | undefined,
        payload,
      }
    } catch {
      // Token is invalid/expired — clear it but don't block yet
      // (only block below if this is a protected route)
    }
  }

  // Determine if this route requires authentication
  // If no serverAuthRoutes configured, all routes require auth (backwards compatible)
  const requiresAuth = auth0.serverAuthRoutes.length === 0 || matchesAuthRoute(path, auth0.serverAuthRoutes)
  if (!requiresAuth) {
    return
  }

  // Route requires auth but user is not authenticated
  if (!event.context.auth) {
    if (isApiRequest(event)) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    return initiateLogin(event, auth0)
  }
})
