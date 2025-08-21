import { Polly } from '@pollyjs/core'
import FetchAdapter from '@pollyjs/adapter-fetch'
import FsPersister from '@pollyjs/persister-fs'

// Register adapters and persisters
Polly.register(FetchAdapter)
Polly.register(FsPersister)

interface PollyConfig {
  // Patterns for requests that should pass through without recording
  passthroughPatterns: string[]
  // Patterns for requests that should be recorded/replayed
  recordPatterns: string[]
  // Whether to allow unmatched requests (default: false - will fail on unmatched)
  allowUnmatched?: boolean
  // Custom logic for complex passthrough decisions
  shouldPassthrough?: (req: any) => boolean
  // Custom logic for complex record decisions  
  shouldRecord?: (req: any) => boolean
}

export function setupPolly (recordingName: string, config: PollyConfig) {
  const isCI = process.env.CI === 'true'
  const polly = new Polly(recordingName, {
    adapters: ['fetch'],
    persister: 'fs',
    persisterOptions: {
      fs: {
        recordingsDir: './testdata/recordings',
      },
    },
    recordIfMissing: !isCI, // Record in non-CI environments
    recordFailedRequests: false, // Never update recordings even on failure
    matchRequestsBy: {
      headers: false,
      body: true,
      url: true,
      order: false,
    },
  })

  // Helper to check if URL matches any pattern
  const matchesAnyPattern = (url: string, patterns: string[]): boolean => {
    return patterns.some(pattern => {
      try {
        return new RegExp(pattern).test(url)
      } catch (e) {
        // If pattern is not valid regex, treat as literal string match
        return url.includes(pattern)
      }
    })
  }

  // Passthrough filter
  polly.server.any().filter((req) => {
    const url = req.url
    
    // Check custom passthrough function first
    if (config.shouldPassthrough?.(req)) {
      console.log(`Polly: Custom passthrough logic matched: ${url}`)
      return true
    }
    
    // Check passthrough patterns
    if (matchesAnyPattern(url, config.passthroughPatterns)) {
      console.log(`Polly: Passthrough pattern matched: ${url}`)
      return true
    }
    
    return false
  }).passthrough()

  // Record filter
  polly.server.any().filter((req) => {
    const url = req.url
    
    // Check custom record function first
    if (config.shouldRecord?.(req)) {
      console.log(`Polly: Custom record logic matched: ${url}`)
      return true
    }
    
    // Check record patterns
    if (matchesAnyPattern(url, config.recordPatterns)) {
      console.log(`Polly: Record pattern matched: ${url}`)
      return true
    }
    
    return false
  }).recordAndReplay()

  // Fail on unmatched requests unless explicitly allowed
  if (!config.allowUnmatched) {
    polly.server.any().filter((req) => {
      const url = req.url
      const shouldPassthrough = config.shouldPassthrough?.(req) || 
        matchesAnyPattern(url, config.passthroughPatterns)
      const shouldRecord = config.shouldRecord?.(req) || 
        matchesAnyPattern(url, config.recordPatterns)
      
      const isUnmatched = !shouldPassthrough && !shouldRecord
      
      if (isUnmatched) {
        console.error(`Polly: Unmatched request detected: ${url}`)
        return true
      }
      
      return false
    }).intercept((req, res) => {
      res.status(400).json({
        error: 'Request blocked by Polly',
        message: `URL ${req.url} is not configured for passthrough or recording. Add to passthroughPatterns, recordPatterns, or set allowUnmatched: true`,
        url: req.url
      })
    })
  }

  // Add request sanitization to remove sensitive headers from recordings
  polly.server.any().on('beforePersist', (req, recording) => {
    console.log(`Polly: Sanitizing request for recording`)
    const sensitiveHeaders = ['authorization', 'apikey']
    recording.request.headers = recording.request.headers.map((header: any) => {
      if (sensitiveHeaders.includes(header.name?.toLowerCase())) {
        header.value = '[REDACTED]'
      }
      return header
    })
  })
  
  return polly
}
