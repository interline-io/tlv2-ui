<template>
  <template v-if="user && user.id">
    <div class="navbar-item">
      <em>You're browsing as <strong>{{ user.name }}</strong></em>
    </div>
    <div class="navbar-item">
      <span class="button is-primary" @click="logout">Sign out</span>
    </div>
  </template>
  <template v-else>
    <div class="navbar-item" />
    <div class="navbar-item">
      <div class="field has-addons">
        <span class="button is-primary" @click="login">Sign in</span>
        <!-- NOTE: "sign up" button can go here if it's relevant to a given deployment -->
      </div>
    </div>
  </template>
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
