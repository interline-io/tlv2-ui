/**
 * Sanitizes objects for logging by redacting sensitive fields
 */

const SENSITIVE_FIELDS = new Set([
  'apikey',
  'api_key',
  'authorization',
  'bearer',
  'token',
  'password',
  'secret',
  'key',
  'csrf',
  'session',
  'cookie'
])

const SENSITIVE_PATTERNS = [
  /key$/i,
  /token$/i,
  /secret$/i,
  /password$/i,
  /bearer$/i,
  /auth/i,
  /csrf/i
]

function sanitizeForLogging (obj: any, redactedValue = '[REDACTED]'): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item, redactedValue))
  }

  if (typeof obj === 'object') {
    const sanitized: any = {}

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase()

      // Check if field name is in sensitive list
      const isSensitive = SENSITIVE_FIELDS.has(lowerKey)
        || SENSITIVE_PATTERNS.some(pattern => pattern.test(key))

      if (isSensitive) {
        sanitized[key] = redactedValue
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeForLogging(value, redactedValue)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  return obj
}

/**
 * Sanitizes a value and converts it to a safe string representation for logging
 * @param value - The value to sanitize (object, string, array, etc.)
 * @param redactedValue - What to replace sensitive values with
 * @returns String representation safe for logging
 */
export function safeStringify (value: any, redactedValue = '[REDACTED]'): string {
  const sanitized = sanitizeForLogging(value, redactedValue)

  try {
    return typeof sanitized === 'string' ? sanitized : JSON.stringify(sanitized, null, 2)
  } catch (error) {
    return '[Unable to stringify object]'
  }
}

/**
 * Headers-specific sanitizer for common web headers
 */
export function sanitizeHeaders (headers: Record<string, any> | Headers): Record<string, any> {
  const headersObj = headers instanceof Headers
    ? Object.fromEntries(headers.entries())
    : headers

  return sanitizeForLogging(headersObj)
}
