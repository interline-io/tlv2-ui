<template>
  <client-only placeholder="">
    <div v-if="user && user.id" class="tl-navbar-user navbar-item has-dropdown is-hoverable">
      <div class="navbar-item" style="margin:0px;padding:0px">
        <o-icon icon="account" />
      </div>
      <div class="navbar-dropdown is-right">
        <div class="navbar-item">
          You are signed in as<br>
          {{ user.email }}
        </div>
        <div class="navbar-item">
          <span class="button is-primary " @click="logout">Sign out</span>
        </div>
      </div>
    </div>
    <div v-else class="tl-navbar-user navbar-item">
      <div class="field has-addons">
        <span class="button is-primary" @click="login">Sign in</span>
        <!-- NOTE: "sign up" button can go here if it's relevant to a given deployment -->
      </div>
    </div>
  </client-only>
</template>

<script>
import { login, logout, useUser } from '../plugins/auth'
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

<style scoped>
.tl-navbar-user {
  padding-left:0px;
  padding-right:10px;
}
</style>
