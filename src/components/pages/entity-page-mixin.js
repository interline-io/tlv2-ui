export default {
  apollo: {
    $error(e) {
      this.error = e
    },
    $query: {
      client: 'transitland',
      update(data) {
        if (data.entities.length === 0) {
          return this.setError(404)
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
      errorMessage: null,
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
    dataFreshness() {
      const daysAgo = []
      const n = new Date()
      try {
        for (const ent of this.entities) {
          const n2 = Date.parse(ent.feed_version.fetched_at)
          daysAgo.push(Math.floor((n2 - n) / (1000 * 3600 * 24 * -1)))
        }
      } catch {
      }
      return Math.max(...daysAgo)
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
    checkSearchSkip(entityId) {
      const fosid = this.$route.query.feed_onestop_id || ''
      const eid = entityId || ''
      if (this.$route.params.onestop_id === 'search' && (fosid.length === 0 || eid.length === 0)) {
        this.setError(404)
        return true
      }
      return false
    },
    setError(statusCode, message) {
      this.$nuxt.error({ statusCode, message })
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
