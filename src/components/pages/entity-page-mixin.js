export default {
  apollo: {
    $query: {
      client: 'transitland',
      error (e) { this.error = e },
      update(data) {
        if (data.entities.length === 0) {
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
      childLabel: null,
      error: null,
      tabIndex: {}
    }
  },
  computed: {
    searchKey() {
      const pk = String(this.pathKey || '')
      const k = pk.split(':')
      if (k.length > 1) {
        return { feed_onestop_id: k[0], entity_id: k.slice(1).join(':'), feed_version_sha1: this.feedVersionSha1 }
      }
      const kInts = pk.split(',').map((s) => { return parseInt(s) }).filter((s) => { return !isNaN(s) })
      if (kInts.length > 0) {
        return { ids: kInts }
      }
      return {
        onestop_id: (this.feedOnestopId && this.feedVersionSha1 && this.entityId) ? null : this.pathKey,
        entity_id: this.entityId,
        feed_onestop_id: this.feedOnestopId,
        feed_version_sha1: this.feedVersionSha1
      }
    },
    advancedMode() {
      if (this.$route.query && this.$route.query.advanced === 'true') {
        return true
      }
      return false
    },
    linkVersion() {
      if (this.searchKey.feed_version_sha1) {
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
