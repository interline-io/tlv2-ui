import { defineEventHandler, getQuery, getCookie, setCookie, sendRedirect, createError, getRequestURL } from 'h3'
import { getAuth0Config, getAuth0BaseUrl, setAuthCookie, verifyToken, STATE_COOKIE } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth0 = getAuth0Config()
  if (!auth0) {
    throw createError({ statusCode: 500, statusMessage: 'Auth not configured' })
  }

  const query = getQuery(event)
  const code = query.code as string | undefined
  const state = query.state as string | undefined

  if (!code || !state) {
    throw createError({ statusCode: 400, statusMessage: 'Missing code or state' })
  }

  // Verify state matches what we stored in the cookie (CSRF protection)
  const storedState = getCookie(event, STATE_COOKIE)
  if (!storedState || storedState !== state) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid state' })
  }

  // Clear the state cookie
  setCookie(event, STATE_COOKIE, '', { path: '/', maxAge: 0 })

  // Parse the state to get the original target URL and PKCE code verifier
  let targetUrl = '/'
  let codeVerifier: string | undefined
  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    targetUrl = stateData.targetUrl || '/'
    codeVerifier = stateData.codeVerifier
  } catch {
    // Fall back to root if state can't be parsed
  }

  if (!codeVerifier) {
    throw createError({ statusCode: 400, statusMessage: 'Missing code verifier' })
  }

  // Exchange the authorization code for tokens (with PKCE code verifier)
  // redirect_uri must match what was sent in the authorize request (see initiateLogin)
  const requestUrl = getRequestURL(event)
  const callbackUrl = `${auth0.redirectUri || requestUrl.origin}/api/auth/callback`
  const tokenResponse = await fetch(`${getAuth0BaseUrl(auth0.domain)}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: auth0.clientId,
      client_secret: auth0.clientSecret,
      code,
      redirect_uri: callbackUrl,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenResponse.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Token exchange failed' })
  }

  const tokenData = await tokenResponse.json() as { access_token: string, expires_in: number }
  const accessToken = tokenData.access_token

  // Verify the token we just received
  try {
    await verifyToken(accessToken, auth0)
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Token verification failed' })
  }

  // Set the JWT as an HttpOnly secure cookie
  setAuthCookie(event, accessToken, tokenData.expires_in)

  // Redirect to the original target URL
  return sendRedirect(event, targetUrl, 302)
})
