import { computed } from 'vue'

// Pattern: [osid]:[feed]@[sha]:[eid]
// Examples: o-abc:feed@sha:entity, feed@sha:entity, feed:entity, o-abc
// eslint-disable-next-line
const pathRegex = /^(?<osid>[ors]-[^:@]+)?:?(?<feed>[^:@]+)?@?(?<sha>[a-z0-9]{40})?:?(?<eid>.*)$/u

interface EntityPathProps {
  pathKey?: string | null
  feedVersionSha1?: string | null
  feedOnestopId?: string | null
  entityId?: string | null
}

interface SearchKey {
  ids?: number[]
  onestopId?: string
  feedOnestopId?: string
  feedVersionSha1?: string
  entityId?: string
  allowPreviousOnestopIds?: boolean
}

interface EntityVariables {
  ids?: number[]
  onestopId?: string
  feedOnestopId?: string
  feedVersionSha1?: string
  entityId?: string
  allowPreviousOnestopIds?: boolean
}

export function useEntityPath (props: EntityPathProps) {
  const searchKey = computed((): SearchKey => {
    let pk = String(props.pathKey || '')
    if (props.feedOnestopId && props.feedVersionSha1 && props.entityId) {
      pk = `${props.feedOnestopId}@${props.feedVersionSha1}:${props.entityId}`
    } else if (props.feedOnestopId && props.entityId) {
      pk = `${props.feedOnestopId}:${props.entityId}`
    }

    // Note: OnestopIDs cannot normally contain ':' or '@' or ',' or be completely numeric

    // Check if the pathKey is comma joined integers
    const kInts = pk.split(',').map(s => Number.parseInt(s)).filter(s => !Number.isNaN(s))
    if (kInts.length > 0) {
      return { ids: kInts }
    }

    const match = pathRegex.exec(pk)?.groups
    if (!match) {
      return {} // not found
    }
    const fv = match.sha || props.feedVersionSha1
    return {
      onestopId: match.osid,
      feedOnestopId: match.feed || props.feedOnestopId || undefined,
      feedVersionSha1: fv || undefined,
      entityId: match.eid,
      allowPreviousOnestopIds: !!fv
    }
  })

  /**
   * Centralized logic for determining GraphQL variables for entity pages.
   * This handles the hybrid approach between simple onestop IDs and complex feed version specific URLs.
   */
  const entityVariables = computed((): EntityVariables => {
    // If we have explicit feed version parameters from query params, use searchKey
    if (props.feedOnestopId || props.feedVersionSha1 || props.entityId) {
      return searchKey.value
    }

    // Check if pathKey contains complex syntax (: or @)
    const pathKeyStr = String(props.pathKey || '')
    if (pathKeyStr.includes(':') || pathKeyStr.includes('@')) {
      return searchKey.value
    }

    // Check if pathKey is comma-separated database IDs
    const kInts = pathKeyStr.split(',').map(s => Number.parseInt(s)).filter(s => !Number.isNaN(s))
    if (kInts.length > 0) {
      return { ids: kInts }
    }

    // For simple cases (basic onestop IDs), use direct pathKey
    return { onestopId: props.pathKey || undefined }
  })

  const linkVersion = computed(() => {
    return !!searchKey.value.feedVersionSha1
  })

  const search = computed(() => {
    return searchKey.value.onestopId === 'search'
  })

  return {
    searchKey,
    entityVariables,
    linkVersion,
    search
  }
}
