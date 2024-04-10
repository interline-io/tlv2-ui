<script>
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
    }
  }
}
</script>
