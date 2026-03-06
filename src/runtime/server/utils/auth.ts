import { importSPKI, createRemoteJWKSet, jwtVerify } from 'jose'
import type { JWTPayload } from 'jose'
import { getCookie, getRequestHeader, getRequestURL, setCookie, sendRedirect } from 'h3'
import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'

// Cached key material (module-level singletons)
let cachedKey: CryptoKey | null = null
let cachedKeyPem: string | null = null
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null
let cachedJwksDomain: string | null = null

const AUTH_COOKIE = 'tlv2_auth_token'
const STATE_COOKIE = 'tlv2_auth_state'

export { AUTH_COOKIE, STATE_COOKIE }

async function getPublicKey (pem: string): Promise<CryptoKey> {
  if (cachedKey && cachedKeyPem === pem) {
    return cachedKey
  }
  cachedKey = await importSPKI(pem, 'RS256')
  cachedKeyPem = pem
  return cachedKey
}

function getJWKS (domain: string) {
  if (cachedJwks && cachedJwksDomain === domain) {
    return cachedJwks
  }
  const issuer = domain.startsWith('https://') ? domain : `https://${domain}`
  cachedJwks = createRemoteJWKSet(new URL(`${issuer.replace(/\/$/, '')}/.well-known/jwks.json`))
  cachedJwksDomain = domain
  return cachedJwks
}

export function getAuth0BaseUrl (domain: string): string {
  const base = domain.startsWith('https://') ? domain : `https://${domain}`
  return base.replace(/\/$/, '')
}

export function getIssuer (domain: string): string {
  return `${getAuth0BaseUrl(domain)}/`
}

export interface Auth0Config {
  domain: string
  clientId: string
  clientSecret: string
  audience?: string
  scope?: string
  publicKey?: string
  redirectUri?: string
  logoutUri?: string
  serverAuthRoutes: string[]
}

export function getAuth0Config (): Auth0Config | null {
  const config = useRuntimeConfig()
  const tlv2Public = config.public?.tlv2 as Record<string, any> || {}
  const tlv2Private = config.tlv2 as Record<string, any> || {}

  const domain = tlv2Public.auth0Domain as string | undefined
  const clientId = tlv2Public.auth0ClientId as string | undefined
  const clientSecret = tlv2Private.auth0ClientSecret as string | undefined

  if (!domain || !clientId || !clientSecret) {
    return null
  }

  return {
    domain,
    clientId,
    clientSecret,
    audience: tlv2Public.auth0Audience as string | undefined,
    scope: tlv2Public.auth0Scope as string | undefined,
    publicKey: tlv2Private.auth0PublicKey as string | undefined,
    redirectUri: tlv2Public.auth0RedirectUri as string | undefined,
    logoutUri: tlv2Public.auth0LogoutUri as string | undefined,
    serverAuthRoutes: (tlv2Private.serverAuthRoutes as string[]) || [],
  }
}

export function extractToken (event: H3Event): string | undefined {
  const authHeader = getRequestHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return getCookie(event, AUTH_COOKIE) || undefined
}

export async function verifyToken (token: string, auth0: Auth0Config): Promise<JWTPayload> {
  const verifyOptions: any = {
    issuer: getIssuer(auth0.domain),
    algorithms: ['RS256'],
  }
  if (auth0.audience) {
    verifyOptions.audience = auth0.audience
  }

  if (auth0.publicKey) {
    const key = await getPublicKey(auth0.publicKey)
    return (await jwtVerify(token, key, verifyOptions)).payload
  }
  const jwks = getJWKS(auth0.domain)
  return (await jwtVerify(token, jwks, verifyOptions)).payload
}

export function setAuthCookie (event: H3Event, token: string, maxAge: number) {
  setCookie(event, AUTH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
}

export function clearAuthCookie (event: H3Event) {
  setCookie(event, AUTH_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function isApiRequest (event: H3Event): boolean {
  const accept = getRequestHeader(event, 'accept') || ''
  const xhr = getRequestHeader(event, 'x-requested-with') || ''
  return accept.includes('application/json') || xhr.toLowerCase() === 'xmlhttprequest'
}

/**
 * Check if a path matches any of the given route patterns.
 * Supports ** as a wildcard suffix (e.g. '/admin/**' matches '/admin/users').
 * Exact paths match exactly (e.g. '/login' matches only '/login').
 */
export function matchesAuthRoute (path: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (pattern.endsWith('/**')) {
      const prefix = pattern.slice(0, -2)
      if (path === prefix || path.startsWith(prefix + '/')) {
        return true
      }
    } else if (path === pattern) {
      return true
    }
  }
  return false
}

export async function generatePKCE (): Promise<{ codeVerifier: string, codeChallenge: string }> {
  const { randomBytes, createHash } = await import('node:crypto')
  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
  return { codeVerifier, codeChallenge }
}

/**
 * Ensure a redirect target is a safe relative path (prevents open redirect).
 */
export function sanitizeRedirectUrl (url: string): string {
  if (!url || !url.startsWith('/') || url.startsWith('//')) {
    return '/'
  }
  return url
}

/**
 * Initiate the Auth0 login flow: generate PKCE, set state cookie, redirect to Auth0.
 */
export async function initiateLogin (event: H3Event, auth0: Auth0Config, returnTo?: string) {
  const { codeVerifier, codeChallenge } = await generatePKCE()
  const requestUrl = getRequestURL(event)
  const targetUrl = sanitizeRedirectUrl(returnTo || requestUrl.pathname + requestUrl.search)
  const stateData = {
    targetUrl,
    codeVerifier,
  }
  const state = Buffer.from(JSON.stringify(stateData)).toString('base64url')

  setCookie(event, STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 300,
  })

  const callbackUrl = `${auth0.redirectUri || requestUrl.origin}/api/auth/callback`
  const loginUrl = buildAuth0AuthorizeUrl(auth0, callbackUrl, state, codeChallenge)
  return sendRedirect(event, loginUrl, 302)
}

export function buildAuth0AuthorizeUrl (auth0: Auth0Config, callbackUrl: string, state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: auth0.clientId,
    redirect_uri: callbackUrl,
    state,
    scope: auth0.scope || 'openid profile email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  if (auth0.audience) {
    params.set('audience', auth0.audience)
  }
  return `${getAuth0BaseUrl(auth0.domain)}/authorize?${params.toString()}`
}
