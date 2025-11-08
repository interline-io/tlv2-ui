// Dynamic proxy route: /api/proxy/[clientId]/[...path]
import { defineEventHandler, getRouterParams, getQuery, getHeaders, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event)
  const clientId = params.clientId as string
  const pathSegments = params.path as string | string[] | undefined
  const path = Array.isArray(pathSegments)
    ? `/${pathSegments.join('/')}`
    : pathSegments
      ? `/${pathSegments}`
      : ''
  
  if (!clientId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Client ID is required'
    })
  }

  try {
    // Import composables at runtime for server-side usage
    const { useApiEndpoint } = await import('../../../../src/runtime/composables/useApiEndpoint')
    const { useAuthHeaders } = await import('../../../../src/runtime/composables/useAuthHeaders')
    
    // Get the upstream endpoint for this client
    const upstreamBase = useApiEndpoint('', clientId)
    if (!upstreamBase) {
      throw createError({
        statusCode: 404,
        statusMessage: `Unknown client ID: ${clientId}`
      })
    }

    const upstreamUrl = upstreamBase + path
    
    // Get auth headers (includes JWT from cookie + API key)
    const authHeaders = useAuthHeaders()
    
    // Forward the request headers, excluding host and connection headers
    const incomingHeaders = getHeaders(event)
    const forwardHeaders: Record<string, string> = {
      ...authHeaders
    }
    
    // Add optional headers if they exist
    if (incomingHeaders['content-type']) {
      forwardHeaders['content-type'] = incomingHeaders['content-type']
    }
    if (incomingHeaders['accept']) {
      forwardHeaders['accept'] = incomingHeaders['accept']
    }
    if (incomingHeaders['user-agent']) {
      forwardHeaders['user-agent'] = incomingHeaders['user-agent']
    }

    // Get query parameters
    const query = getQuery(event)
    const queryString = new URLSearchParams(query as Record<string, string>).toString()
    const fullUrl = queryString ? `${upstreamUrl}?${queryString}` : upstreamUrl

    // Forward the request to upstream server
    let body = undefined
    if (event.node.req.method !== 'GET' && event.node.req.method !== 'HEAD') {
      body = await readBody(event)
    }

    const response = await $fetch.raw(fullUrl, {
      method: event.node.req.method as any,
      headers: forwardHeaders,
      body,
      // Don't follow redirects, let the client handle them
      redirect: 'manual'
    })

    // Set response headers
    if (response.headers) {
      for (const [key, value] of Object.entries(response.headers)) {
        // Skip headers that shouldn't be forwarded
        if (!['transfer-encoding', 'connection', 'keep-alive', 'upgrade'].includes(key.toLowerCase())) {
          event.node.res.setHeader(key, value as string)
        }
      }
    }

    // Set status code
    event.node.res.statusCode = response.status

    // Return the response data
    return response._data
  } catch (error: any) {
    console.error(`Proxy error for client ${clientId}:`, error)
    
    // If it's a fetch error with a response, forward that
    if (error.response) {
      throw createError({
        statusCode: error.response.status || 500,
        statusMessage: error.response.statusText || 'Upstream server error',
        data: error.response._data
      })
    }
    
    // Otherwise throw a generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'Proxy server error'
    })
  }
})
