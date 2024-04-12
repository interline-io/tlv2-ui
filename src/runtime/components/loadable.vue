<script lang="ts">
import { useJwt } from '../plugins/auth'

export default {
  data () {
    return {
      error: null,
      loading: false
    }
  },
  computed: {
    apiBase() {
      return this.$config.public.apiBase
    }
  },
  methods: {
    async authBearer () {
      return 'Bearer ' + await useJwt()
    },
    async fetchRest(path: String, data: Object, method: String) {
      method = method || 'GET'
      const body = {
        'Content-Type': 'application/json',
        headers: { authorization: await this.authBearer() },
        method
      }
      const target = new URL(`${this.apiBase}${path}`)
      if (data) {
        if (method === 'PUT' || method === 'POST' || method === 'DELETE') {
          body.body = JSON.stringify(data)
        } else {
          for (const [k, v] of Object.entries(data)) {
            target.searchParams.set(k, v)
          }
        }
      }
      this.loading = true
      return fetch(target.toString(), body)
        .then(this.handleError)
        .catch(this.setError)
        .then((data) => {
          this.loading = false
          return data
        })
    },
    fetchAdmin(path: String, params: Object, method: String) {
      return this.fetchRest('/admin' + path, params, method)
    },
    handleError (response) {
      if (!response.ok) {
        console.log('request failed', response.status, response.statusText)
        throw new Error(`${response.status}: ${response.statusText || 'request failed'}`)
      } else {
        return response.json()
      }
    },
    setError (e) {
      this.error = e
      this.loading = false
    }
  }
}
</script>
