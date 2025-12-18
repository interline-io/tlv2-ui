import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import {
  analystFeedQuery,
  feedVersionDefaultDate,
  SelectedFeedVersion,
  type FeedVersionData,
  type AnalystFeedQueryResponse
} from './scenario'

// ============================================================================
// Types
// ============================================================================

/**
 * A feed version paired with contextual information for filtering decisions.
 */
export interface FeedVersionCandidate {
  feedVersion: FeedVersionData
  /**
   * True when this feed version is the currently active/published version for its feed.
   * Determined by: feedVersion.feed.feed_state.feed_version.id === feedVersion.id
   */
  isActive: boolean
}

/**
 * A selected feed version with its service date.
 * Returned by filter functions.
 */
export interface FeedVersionSelection extends FeedVersionCandidate {
  /**
   * Service date for this feed version (YYYY-MM-DD format).
   * Use \`feedVersionDefaultDate()\` helper if you want the standard default.
   */
  serviceDate: string
}

/**
 * Filter function that receives ALL feed version candidates and returns the subset
 * to use as defaults. The filter is fully responsible for:
 * - Selecting which feed versions to include
 * - Providing a serviceDate for each selection (use \`feedVersionDefaultDate()\` helper for standard default)
 *
 * This design allows complex selection logic that needs full context, such as:
 * - "Pick one active version per agency"
 * - "Prefer feed A over feed B if both exist"
 * - "Select the most recent version for each onestop_id"
 */
export type FeedVersionFilter = (candidates: FeedVersionCandidate[]) => FeedVersionSelection[]

/**
 * Options for the useFeedVersions composable.
 */
export interface UseFeedVersionsOptions {
  /**
   * Filter to select which feed versions to include in defaults.
   * Receives all candidates with isActive context, returns subset to use.
   * Default: allActive (only active feed versions)
   */
  filter?: FeedVersionFilter
}

// ============================================================================
// Pre-baked Filters
// ============================================================================

/**
 * Default filter: returns all active feed versions with default service dates.
 * A feed version is "active" when it is the currently published version for its feed.
 */
export const allActive: FeedVersionFilter = candidates =>
  candidates
    .filter(c => c.isActive)
    .map(c => ({
      ...c,
      serviceDate: feedVersionDefaultDate(c.feedVersion) ?? ''
    }))

/**
 * Creates a filter that returns only active feed versions for specific feeds.
 * @param onestopIds - Array of feed onestop_ids to include
 * @returns Filter function restricted to those feeds
 *
 * @example
 * const bartOnly = allActiveForFeeds(['f-9q9-bart'])
 * const { defaultSelectedFeedVersions } = useFeedVersions(geometry, { filter: bartOnly })
 */
export function allActiveForFeeds (onestopIds: string[]): FeedVersionFilter {
  const allowedSet = new Set(onestopIds)
  return candidates =>
    candidates
      .filter(c => c.isActive && allowedSet.has(c.feedVersion.feed?.onestop_id ?? ''))
      .map(c => ({
        ...c,
        serviceDate: feedVersionDefaultDate(c.feedVersion) ?? ''
      }))
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Composable for fetching and selecting default feed versions for a geometry.
 *
 * Note: The geometry is treated as constant - changes after initial call are not supported.
 *
 * ## How Default Feed Version Selection Works:
 *
 * 1. **Query feeds by geometry**: Fetches all feeds that intersect with the provided
 *    geometry using the \`analystFeedQuery\` GraphQL query.
 *
 * 2. **Collect importable feed versions**: All feed versions with a successful GTFS import
 *    (\`feed_version_gtfs_import.success === true\`) are added to the \`feedVersions\` list.
 *
 * 3. **Build candidates with context**: Each feed version is wrapped with an \`isActive\` flag,
 *    determined by whether the feed version ID matches the feed's \`feed_state.feed_version.id\`.
 *
 * 4. **Apply filter**: The filter function receives ALL candidates and returns the subset
 *    to use as defaults with their service dates. The filter is fully responsible for selection
 *    and service date assignment - there are no fallbacks. The default filter is \`allActive\`.
 *
 * @param geometry - GeoJSON geometry to query feeds by spatial intersection (Point, Polygon, etc.)
 * @param options - Optional configuration, including a custom filter function
 *
 * @example
 * // Basic usage
 * const { defaultSelectedFeedVersions } = useFeedVersions(stationArea.value?.geometry)
 *
 * @example
 * // With custom filter
 * const { defaultSelectedFeedVersions } = useFeedVersions(
 *   stationArea.value?.geometry,
 *   { filter: allActiveForFeeds(['f-9q9-bart']) }
 * )
 */
export function useFeedVersions (
  geometry: GeoJSON.Geometry | null | undefined,
  options?: MaybeRefOrGetter<UseFeedVersionsOptions>
) {
  const { result: feedResult, loading: feedLoading, error: feedError } = useQuery<AnalystFeedQueryResponse>(
    analystFeedQuery,
    { geometry },
    { enabled: !!geometry }
  )

  // Derive error from query
  const error = computed<Error | null>(() => feedError.value || null)

  // Derive feedVersions directly from query result - no intermediate ref needed
  const feedVersions = computed<FeedVersionData[]>(() => {
    const data = feedResult.value
    if (!data) return []
    const fvs: FeedVersionData[] = []
    for (const feed of data.feeds) {
      for (const fv of feed.feed_versions) {
        if (fv.feed_version_gtfs_import?.success === true) {
          fvs.push(fv)
        }
      }
    }
    return fvs
  })

  // Derive active feed version IDs from query result
  const activeFeedVersionIds = computed<Set<number>>(() => {
    const data = feedResult.value
    if (!data) return new Set()
    const activeIds = new Set<number>()
    for (const feed of data.feeds) {
      if (feed.feed_state?.feed_version?.id) {
        activeIds.add(feed.feed_state.feed_version.id)
      }
    }
    return activeIds
  })

  /**
   * Build candidates with isActive computed from activeFeedVersionIds.
   * isActive is true when this feed version is the currently published version for its feed.
   */
  const candidates = computed<FeedVersionCandidate[]>(() => {
    return feedVersions.value.map(fv => ({
      feedVersion: fv,
      isActive: activeFeedVersionIds.value.has(fv.id)
    }))
  })

  const defaultSelectedFeedVersions = computed<SelectedFeedVersion[]>(() => {
    const opts = toValue(options)
    const filter = opts?.filter ?? allActive

    // Log pre-filter candidates
    console.debug('[useFeedVersions] Pre-filter candidates:', candidates.value.length, candidates.value.map(c => ({
      id: c.feedVersion.id,
      onestop_id: c.feedVersion.feed?.onestop_id,
      isActive: c.isActive
    })))

    // Apply filter
    const selected = filter(candidates.value)

    // Log post-filter results
    console.debug('[useFeedVersions] Post-filter selected:', selected.length, selected.map(c => ({
      id: c.feedVersion.id,
      onestop_id: c.feedVersion.feed?.onestop_id,
      isActive: c.isActive
    })))

    const defaults = selected.map(c => new SelectedFeedVersion({
      id: c.feedVersion.id,
      serviceDate: c.serviceDate
    }))

    return defaults
  })

  return {
    feedVersions,
    candidates,
    defaultSelectedFeedVersions,
    loading: feedLoading,
    error
  }
}
