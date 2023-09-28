<template>
  <template v-if="user && user.id">
    <div class="navbar-item">
      <em>You're browsing as <strong>{{ user.name }}</strong></em> <!-- TODO: replace with user's name and/or email -->
    </div>
    <div class="navbar-item">
      <span class="button is-primary" @click="logout">Sign out</span>
    </div>
  </template>
  <template v-else>
    <div class="navbar-item">
      <em>Unlock more functionality with a free account:</em>
    </div>
    <div class="navbar-item">
      <div class="field has-addons">
        <span class="button is-primary" @click="login">Sign in</span>
        <a href="https://app.interline.io/products/tlv2_api/orders/new" class="button is-secondary">Sign up</a>
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
