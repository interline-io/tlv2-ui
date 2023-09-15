<template>
  <div>
    <span v-if="user && user.id" class="button is-primary" @click="logout">Logout {{ user.id.slice(0,10) }}...</span>
    <span v-else class="button is-primary" @click="login">Login</span>
  </div>
</template>

<script>
import { login, logout } from '~/src/plugins/auth0'
export default {
  data() {
    const user = useState('user')
    return {
      user
    }
  },
  methods: {
    async login() {
      await login()
    },
    async logout() {
      await logout()
    }
  }
}
</script>
