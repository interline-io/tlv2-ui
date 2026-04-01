import { describe, it, expect } from 'vitest'
import { parseProxyRoute, resolveProxyBase, buildProxyTarget, buildProxyHeaders } from './proxy-route'

describe('parseProxyRoute', () => {
  it('extracts backend name and strips prefix', () => {
    expect(parseProxyRoute('/api/proxy/default/query')).toEqual({
      backendName: 'default',
      strippedPath: '/query'
    })
  })

  it('handles stationEditor backend', () => {
    expect(parseProxyRoute('/api/proxy/stationEditor/query')).toEqual({
      backendName: 'stationEditor',
      strippedPath: '/query'
    })
  })

  it('handles nested paths', () => {
    expect(parseProxyRoute('/api/proxy/feedManagement/admin/feeds/123')).toEqual({
      backendName: 'feedManagement',
      strippedPath: '/admin/feeds/123'
    })
  })

  it('returns null for path without backend segment', () => {
    expect(parseProxyRoute('/api/proxy/')).toBeNull()
  })

  it('defaults to "/" when no trailing path', () => {
    expect(parseProxyRoute('/api/proxy/default')).toEqual({
      backendName: 'default',
      strippedPath: '/'
    })
  })

  it('returns null for empty path', () => {
    expect(parseProxyRoute('')).toBeNull()
  })
})

describe('resolveProxyBase', () => {
  const proxyBases = {
    default: 'https://api.transit.land/api/v2',
    stationEditor: 'https://station-api.example.com',
    feedManagement: 'https://feed-api.example.com/v1'
  }

  it('resolves known backend', () => {
    expect(resolveProxyBase('default', proxyBases)).toBe('https://api.transit.land/api/v2')
    expect(resolveProxyBase('stationEditor', proxyBases)).toBe('https://station-api.example.com')
    expect(resolveProxyBase('feedManagement', proxyBases)).toBe('https://feed-api.example.com/v1')
  })

  it('returns null for unknown backend', () => {
    expect(resolveProxyBase('nonexistent', proxyBases)).toBeNull()
  })

  it('returns null for empty proxyBases', () => {
    expect(resolveProxyBase('default', {})).toBeNull()
  })
})

describe('buildProxyTarget', () => {
  it('appends path to proxyBase with subpath', () => {
    expect(buildProxyTarget('https://api.transit.land/api/v2', '/query'))
      .toBe('https://api.transit.land/api/v2/query')
  })

  it('appends path to proxyBase at root', () => {
    expect(buildProxyTarget('https://station-api.example.com', '/query'))
      .toBe('https://station-api.example.com/query')
  })

  it('handles trailing slash on proxyBase', () => {
    expect(buildProxyTarget('https://api.example.com/', '/query'))
      .toBe('https://api.example.com/query')
  })

  it('handles root path', () => {
    expect(buildProxyTarget('https://api.example.com/v2', '/'))
      .toBe('https://api.example.com/v2/')
  })

  it('handles nested request paths', () => {
    expect(buildProxyTarget('https://api.example.com/v2', '/admin/feeds/123'))
      .toBe('https://api.example.com/v2/admin/feeds/123')
  })

  it('handles query strings in path', () => {
    expect(buildProxyTarget('https://api.example.com/v2', '/query?limit=10'))
      .toBe('https://api.example.com/v2/query?limit=10')
  })
})

describe('buildProxyHeaders', () => {
  it('includes graphql apikey', () => {
    const headers = buildProxyHeaders('my-api-key')
    expect(headers).toEqual({ apikey: 'my-api-key' })
  })

  it('includes authorization when accessToken provided', () => {
    const headers = buildProxyHeaders('my-api-key', 'jwt-token')
    expect(headers).toEqual({
      apikey: 'my-api-key',
      authorization: 'Bearer jwt-token'
    })
  })

  it('omits authorization when accessToken is empty', () => {
    const headers = buildProxyHeaders('my-api-key', '')
    expect(headers).toEqual({ apikey: 'my-api-key' })
  })

  it('prefers requestApikey over graphqlApikey', () => {
    const headers = buildProxyHeaders('server-key', undefined, 'user-key')
    expect(headers).toEqual({ apikey: 'user-key' })
  })

  it('falls back to graphqlApikey when no requestApikey', () => {
    const headers = buildProxyHeaders('server-key', undefined, '')
    expect(headers).toEqual({ apikey: 'server-key' })
  })

  it('includes all headers when everything is provided', () => {
    const headers = buildProxyHeaders('server-key', 'jwt-token', 'user-key')
    expect(headers).toEqual({
      apikey: 'user-key',
      authorization: 'Bearer jwt-token'
    })
  })
})
