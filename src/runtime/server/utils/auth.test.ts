import { describe, it, expect, vi } from 'vitest'

// Mock #imports before importing auth module
vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    tlv2: {},
    public: { tlv2: {} },
  }),
}))

const { sanitizeRedirectUrl, matchesAuthRoute, generatePKCE, getAuth0BaseUrl, getIssuer, buildAuth0AuthorizeUrl } = await import('./auth')
type Auth0Config = import('./auth').Auth0Config

describe('sanitizeRedirectUrl', () => {
  it('allows simple relative paths', () => {
    expect(sanitizeRedirectUrl('/admin')).toBe('/admin')
    expect(sanitizeRedirectUrl('/admin/users')).toBe('/admin/users')
    expect(sanitizeRedirectUrl('/admin?foo=bar')).toBe('/admin?foo=bar')
    expect(sanitizeRedirectUrl('/')).toBe('/')
  })

  it('rejects empty string', () => {
    expect(sanitizeRedirectUrl('')).toBe('/')
  })

  it('rejects protocol-relative URLs (open redirect)', () => {
    expect(sanitizeRedirectUrl('//evil.com')).toBe('/')
    expect(sanitizeRedirectUrl('//evil.com/path')).toBe('/')
  })

  it('rejects absolute URLs', () => {
    expect(sanitizeRedirectUrl('https://evil.com')).toBe('/')
    expect(sanitizeRedirectUrl('http://evil.com/path')).toBe('/')
  })

  it('rejects paths not starting with /', () => {
    expect(sanitizeRedirectUrl('evil.com')).toBe('/')
    expect(sanitizeRedirectUrl('javascript:alert(1)')).toBe('/')
  })
})

describe('matchesAuthRoute', () => {
  it('matches exact paths', () => {
    expect(matchesAuthRoute('/settings', ['/settings'])).toBe(true)
  })

  it('does not match different exact paths', () => {
    expect(matchesAuthRoute('/other', ['/settings'])).toBe(false)
  })

  it('does not partially match exact paths', () => {
    expect(matchesAuthRoute('/settings/extra', ['/settings'])).toBe(false)
  })

  it('matches wildcard prefix', () => {
    expect(matchesAuthRoute('/admin', ['/admin/**'])).toBe(true)
    expect(matchesAuthRoute('/admin/', ['/admin/**'])).toBe(true)
    expect(matchesAuthRoute('/admin/users', ['/admin/**'])).toBe(true)
    expect(matchesAuthRoute('/admin/users/123', ['/admin/**'])).toBe(true)
  })

  it('does not match unrelated paths for wildcard', () => {
    expect(matchesAuthRoute('/public', ['/admin/**'])).toBe(false)
    expect(matchesAuthRoute('/administrator', ['/admin/**'])).toBe(false)
  })

  it('matches against multiple patterns', () => {
    const patterns = ['/admin/**', '/api/admin/**', '/settings']
    expect(matchesAuthRoute('/admin/users', patterns)).toBe(true)
    expect(matchesAuthRoute('/api/admin/config', patterns)).toBe(true)
    expect(matchesAuthRoute('/settings', patterns)).toBe(true)
    expect(matchesAuthRoute('/public', patterns)).toBe(false)
  })

  it('returns false for empty patterns', () => {
    expect(matchesAuthRoute('/anything', [])).toBe(false)
  })
})

describe('generatePKCE', () => {
  it('returns a code verifier and challenge', async () => {
    const { codeVerifier, codeChallenge } = await generatePKCE()
    expect(codeVerifier).toBeTruthy()
    expect(codeChallenge).toBeTruthy()
    expect(codeVerifier).not.toBe(codeChallenge)
  })

  it('generates unique values each time', async () => {
    const a = await generatePKCE()
    const b = await generatePKCE()
    expect(a.codeVerifier).not.toBe(b.codeVerifier)
    expect(a.codeChallenge).not.toBe(b.codeChallenge)
  })

  it('challenge is base64url SHA-256 of verifier', async () => {
    const { codeVerifier, codeChallenge } = await generatePKCE()
    const { createHash } = await import('node:crypto')
    const expected = createHash('sha256').update(codeVerifier).digest('base64url')
    expect(codeChallenge).toBe(expected)
  })
})

describe('getAuth0BaseUrl', () => {
  it('adds https:// prefix when missing', () => {
    expect(getAuth0BaseUrl('example.auth0.com')).toBe('https://example.auth0.com')
  })

  it('preserves existing https:// prefix', () => {
    expect(getAuth0BaseUrl('https://example.auth0.com')).toBe('https://example.auth0.com')
  })

  it('strips trailing slash', () => {
    expect(getAuth0BaseUrl('https://example.auth0.com/')).toBe('https://example.auth0.com')
  })
})

describe('getIssuer', () => {
  it('returns base URL with trailing slash', () => {
    expect(getIssuer('example.auth0.com')).toBe('https://example.auth0.com/')
  })
})

describe('buildAuth0AuthorizeUrl', () => {
  const config: Auth0Config = {
    domain: 'example.auth0.com',
    clientId: 'test-client-id',
    clientSecret: 'secret',
    audience: 'https://api.example.com/',
    scope: 'openid profile email',
    serverAuthRoutes: [],
  }

  it('builds correct authorize URL', () => {
    const url = buildAuth0AuthorizeUrl(config, 'https://app.com/api/auth/callback', 'test-state', 'test-challenge')
    const parsed = new URL(url)
    expect(parsed.origin).toBe('https://example.auth0.com')
    expect(parsed.pathname).toBe('/authorize')
    expect(parsed.searchParams.get('response_type')).toBe('code')
    expect(parsed.searchParams.get('client_id')).toBe('test-client-id')
    expect(parsed.searchParams.get('redirect_uri')).toBe('https://app.com/api/auth/callback')
    expect(parsed.searchParams.get('state')).toBe('test-state')
    expect(parsed.searchParams.get('scope')).toBe('openid profile email')
    expect(parsed.searchParams.get('code_challenge')).toBe('test-challenge')
    expect(parsed.searchParams.get('code_challenge_method')).toBe('S256')
    expect(parsed.searchParams.get('audience')).toBe('https://api.example.com/')
  })

  it('omits audience when not configured', () => {
    const noAudience = { ...config, audience: undefined }
    const url = buildAuth0AuthorizeUrl(noAudience, 'https://app.com/cb', 'state', 'challenge')
    const parsed = new URL(url)
    expect(parsed.searchParams.has('audience')).toBe(false)
  })

  it('uses default scope when not configured', () => {
    const noScope = { ...config, scope: undefined }
    const url = buildAuth0AuthorizeUrl(noScope, 'https://app.com/cb', 'state', 'challenge')
    const parsed = new URL(url)
    expect(parsed.searchParams.get('scope')).toBe('openid profile email')
  })
})
