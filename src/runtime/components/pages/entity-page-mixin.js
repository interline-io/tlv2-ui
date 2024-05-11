const pathRegex = /(?<osid>[ors]-[a-z0-9~-]*)?:?(?<feed>[a-z0-9~-]*)?@?((?<sha>[a-z0-9]{40})?)?:?(?<eid>.*)*$/
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
      update(data) {
        if (data && data.entities && data.entities.length === 0) {
          return this.setError(404, 'Not found')
        }
        return data.entities
      }
    }
  },
  props: {
    pathKey: { type: String, default: null },
    feedVersionSha1: { type: String, default: null },
    feedOnestopId: { type: String, default: null },
    entityId: { type: String, default: null }
  },
  data() {
    return {
      entities: [],
      activeTab: 1,
      newLimit: null,
      childLabel: null,
      error: null,
      tabIndex: {}
    }
  },
  computed: {
    searchKey() {
      let pk = String(this.pathKey || '')
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

      // Check if pathKey is <feed>:<entity_id> or <feed>@<sha1>:<entity_id> or @<sha1>:<entity_id>
      // Anything with ':' will be interpreted like this
      // const kFeedEntity = pk.split(':')
      // if (kFeedEntity.length > 1) {
      //   const kFeedVersion = kFeedEntity[0].split('@')
      //   return {
      //     feed_onestop_id: kFeedVersion[0],
      //     feed_version_sha1: kFeedVersion.length > 1 ? kFeedVersion[1] : this.feedVersionSha1,
      //     entity_id: kFeedEntity.slice(1).join(':')
      //   }
      // }

      // // Check if <onestop_id> or <onestop_id>@<sha1>
      // // Must not contain ':'
      // const kOsid = pk.split('@')
      // const fv = kOsid.length > 1 ? kOsid[1] : this.feedVersionSha1
      // return {
      //   feed_onestop_id: this.feedOnestopId,
      //   feed_version_sha1: fv,
      //   onestop_id: kOsid[0],
      //   allow_previous_onestop_ids: (!!fv) // allowed if no version is specified
      // }
    },
    linkVersion() {
      if (this.searchKey.feedVersionSha1) {
        return true
      }
    },
    search() {
      return this.searchKey.onestop_id === 'search'
    },
    entity() {
      return (this.entities && this.entities.length > 0) ? this.entities[0] : null
    },
    entityIds() {
      return this.entities.map((s) => { return s.id })
    },
    fvids() {
      return (this.agencies || []).map((s) => { return s.feed_version_id })
    }
  },
  watch: {
    childLabel() {
      this.activeTab = 5
    }
  },
  mounted() {
    const tab = this.$route.hash.substr(1)
    if (tab) {
      for (const [k, v] of Object.entries(this.tabIndex)) {
        if (v === tab) {
          this.activeTab = parseInt(k)
        }
      }
    }
  },
  methods: {
    refetchEntities() {
      this.$apollo.queries.entities.refetch()
    },
    checkSearchSkip() {
      const fosid = this.$route.query.feed_onestop_id || ''
      const eid = this.$route.query.entity_id || ''
      if (this.$route.params.onestop_id === 'search' && (fosid.length === 0 || eid.length === 0)) {
        this.setError(404, 'Not found')
        return true
      }
      return false
    },
    setError(statusCode, message) {
      // this.$nuxt.error({ statusCode, message })
      this.error = message
    },
    setTab(value) {
      const tab = this.tabIndex[value]
      if (tab) {
        // set window.location.hash directly; this.$router.push causes reload
        window.location.hash = tab
      }
    }
  }
}
