import { defineEventHandler, sendRedirect } from 'h3'
import { getAuth0Config, getAuth0BaseUrl, clearAuthCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth0 = getAuth0Config()
  if (!auth0) {
    return sendRedirect(event, '/', 302)
  }

  // Clear the auth cookie
  clearAuthCookie(event)

  // Redirect to Auth0 logout endpoint
  const returnTo = auth0.logoutUri || auth0.redirectUri || '/'
  const params = new URLSearchParams({
    client_id: auth0.clientId,
    returnTo,
  })
  return sendRedirect(event, `${getAuth0BaseUrl(auth0.domain)}/v2/logout?${params.toString()}`, 302)
})
