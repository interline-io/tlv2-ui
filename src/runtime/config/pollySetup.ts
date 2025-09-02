import { Polly } from '@pollyjs/core'
import FetchAdapter from '@pollyjs/adapter-fetch'
import FsPersister from '@pollyjs/persister-fs'

// Register adapters and persisters
Polly.register(FetchAdapter)
Polly.register(FsPersister)

export function setupPolly (recordingName: string) {
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

  // Passthrough requests to localhost and 127.0.0.1
  polly.server.any().filter((req) => {
    console.warn(`Polly checking filter: ${req.url}`)
    return (req.url.startsWith('http://localhost') || req.url.startsWith('http://127.0.0.1'))
  })
    .passthrough()

  // Add request sanitization to remove sensitive headers from recordings
  polly.server.any().on('beforePersist', (req, recording) => {
    console.log(`Sanitizing request for recording`)
    const sensitiveHeaders = ['authorization', 'apikey']
    recording.request.headers = recording.request.headers.map((header: any) => {
      if (sensitiveHeaders.includes(header.name?.toLowerCase())) {
        header.value = ''
      }
      return header
    })
  })
  return polly
}
