const pathRegex = /(?<osid>[ors]-[^:@]*)?:?(?<feed>[^:@]*)?@?((?<sha>[a-z0-9]{40})?)?:?(?<eid>.*)$/u
// console.log(pathRegex.exec('r-osid').groups)
// console.log(pathRegex.exec('r-osid:feed').groups)
// console.log(pathRegex.exec('s-osid').groups)
// console.log(pathRegex.exec('s-osid:feed').groups)
// console.log(pathRegex.exec('r-osid@76de8e75c70e1c0fc1c8c8d6cf6ae7dcb77bde90').groups)
// console.log(pathRegex.exec('r-osid:feed@76de8e75c70e1c0fc1c8c8d6cf6ae7dcb77bde90').groups)
// console.log(pathRegex.exec('feed:eid').groups)
// console.log(pathRegex.exec('feed@76de8e75c70e1c0fc1c8c8d6cf6ae7dcb77bde90:eid').groups)
// console.log(pathRegex.exec('@76de8e75c70e1c0fc1c8c8d6cf6ae7dcb77bde90:eid').groups)
// console.log(pathRegex.exec('r-osid:feed@76de8e75c70e1c0fc1c8c8d6cf6ae7dcb77bde90:eid').groups)

export default {
  apollo: {
    $query: {
      client: 'transitland',
      error (e) { this.error = e },
      update (data) {
        if (data && data.entities && data.entities.length === 0) {
          return this.setError(404, 'Not found')
        }
        return data.entities || []
      }
    }
  },
  props: {
    pathKey: { type: String, default: null },
    feedVersionSha1: { type: String, default: null },
    feedOnestopId: { type: String, default: null },
    entityId: { type: String, default: null }
  },
  data () {
    return {
      entities: [],
      activeTab: 'default',
      tabNames: {},
      newLimit: null,
      childLabel: null,
      error: null,
    }
  },
  computed: {
    searchKey () {
      let pk = String(this.pathKey || '')
      
      // Only decode if the path key contains URL-encoded characters (%)
      if (pk.includes('%')) {
        try {
          pk = decodeURIComponent(pk)
        } catch (e) {
          // If decoding fails, use the original string
          console.warn('Failed to decode URL parameter:', pk, e)
        }
      }
      
      if (this.feedOnestopId && this.feedVersionSha1 && this.entityId) {
        pk = `${this.feedOnestopId}@${this.feedVersionSha1}:${this.entityId}`
      } else if (this.feedOnestopId && this.entityId) {
        pk = `${this.feedOnestopId}:${this.entityId}`
      }

      // Note: OnestopIDs cannot normally contain ':' or '@' or ',' or be completely numeric

      // Check if the pathKey is comma joined integers
      const kInts = pk.split(',').map((s) => { return parseInt(s) }).filter((s) => { return !isNaN(s) })
      if (kInts.length > 0) {
        return { ids: kInts }
      }

      const match = pathRegex.exec(pk)?.groups
      if (!match) {
        return {} // not found
      }
      const fv = match.sha || this.feedVersionSha1
      return {
        onestopId: match.osid,
        feedOnestopId: match.feed || this.feedOnestopId,
        feedVersionSha1: fv,
        entityId: match.eid,
        allowPreviousOnestopIds: !!fv
      }
    },
    linkVersion () {
      if (this.searchKey.feedVersionSha1) {
        return true
      }
    },
    search () {
      return this.searchKey.onestopId === 'search'
    },
    entity () {
      return (this.entities && this.entities.length > 0) ? this.entities[0] : null
    },
    entityIds () {
      return this.entities.map((s) => { return s.id })
    },
    fvids () {
      return (this.agencies || []).map((s) => { return s.feed_version_id })
    }
  },
  methods: {
    makeTabNames (vals) {
      const a = {}
      for (const k of vals) {
        a[k] = k
      }
      return a
    },
    refetchEntities () {
      this.$apollo.queries.entities.refetch()
    },
    checkSearchSkip () {
      const fosid = this.$route.query.feed_onestop_id || ''
      const eid = this.$route.query.entity_id || ''
      if (this.$route.params.onestop_id === 'search' && (fosid.length === 0 || eid.length === 0)) {
        this.setError(404, 'Not found')
        return true
      }
      return false
    },
    setError (statusCode, message) {
      // this.$nuxt.error({ statusCode, message })
      this.error = message
    },
    setTab (value) {
      // TODO
    }
  }
}
