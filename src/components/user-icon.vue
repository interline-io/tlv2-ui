<template>
  <client-only>
    <template v-if="user && user.id">
      <div class="navbar-item">
        <em>You're browsing as <strong>{{ user.name }}</strong></em>
      </div>
      <div class="navbar-item" style="margin:0px;padding:0px">
        <span class="button is-primary is-small" @click="logout">Sign out</span>
      </div>
    </template>
    <template v-else>
      <div class="navbar-item" style="margin:0px;padding:0px">
        <div class="field has-addons">
          <span class="button is-primary is-small" @click="login">Sign in</span>
        <!-- NOTE: "sign up" button can go here if it's relevant to a given deployment -->
        </div>
      </div>
    </template>
  </client-only>
</template>

<script>
import { login, logout, useUser } from '~/src/plugins/auth'
export default {
  data() {
    return {
      user: useUser()
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
