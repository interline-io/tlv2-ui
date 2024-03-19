<script>
import { useUser, useJwt } from '../../plugins/auth'

const OBJECTTYPES = {
  empty_object: 0,
  tenant: 1,
  org: 2,
  feed: 3,
  feed_version: 4,
  user: 5
}

const RELATIONS = {
  empty_relation: 0,
  admin: 1,
  member: 2,
  manager: 3,
  viewer: 4,
  editor: 5,
  parent: 6
}

export default {
  data () {
    return {
      error: null,
      loading: false
    }
  },
  computed: {
    user () {
      return useUser()
    }
  },
  methods: {
    async getAuthToken () {
      const token = await useJwt()
      return 'Bearer ' + token
    },
    apiBase () {
      return this.$config.public.apiBase
    },
    nameSorted (v) {
      return (v || []).slice(0).sort((a, b) => { return (a.name || '').localeCompare(b.name || '') })
    },
    handleError (response) {
      if (!response.ok) {
        console.log('request failed', response.statusText)
        throw new Error(response.statusText)
      } else {
        // console.log('request ok')
        return response.json()
      }
    },
    setError (e) {
      this.error = e
      this.loading = false
    },
    ObjectTypes (v) {
      return OBJECTTYPES[v]
    },
    Relations (v) {
      return RELATIONS[v]
    }
  }
}
</script>
