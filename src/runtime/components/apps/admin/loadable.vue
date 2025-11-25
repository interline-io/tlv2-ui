<script lang="ts">
import { useApiEndpoint } from '../../../composables/useApiEndpoint'
import { useAuthHeaders } from '../../../composables/useAuthHeaders'

export default {
  data () {
    return {
      error: null,
      loading: false,
      client: 'default'
    }
  },
  methods: {
    apiEndpoint: () => (useApiEndpoint('', 'feedManagement')),
    authHeaders: () => (useAuthHeaders()),
    async fetchRest (path: string, data: object, method: string) {
      method = method || 'GET'
      const body: Record<string, any> = {
        'Content-Type': 'application/json',
        'headers': await this.authHeaders(),
        method
      }
      const target = new URL(`${this.apiEndpoint()}${path}`)
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
    fetchAdmin (path: string, params: object, method: string) {
      return this.fetchRest('/admin' + path, params, method)
    },
    handleError (response: any) {
      if (!response.ok) {
        console.error('request failed', response.status, response.statusText)
        throw new Error(`${response.status}: ${response.statusText || 'request failed'}`)
      } else {
        return response.json()
      }
    },
    setError (e: any) {
      console.error(e)
      this.error = e
      this.loading = false
      throw e
    }
  }
}
</script>
